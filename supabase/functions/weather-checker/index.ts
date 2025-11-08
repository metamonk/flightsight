// Weather Checker Edge Function
// Runs hourly via QStash to check weather conditions for upcoming flights

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY')!
const WEATHER_API_URL = Deno.env.get('WEATHER_API_URL') || 'https://api.weatherapi.com/v1'
const WEATHER_CACHE_TTL = parseInt(Deno.env.get('WEATHER_CACHE_TTL_SECONDS') || '1800')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const QSTASH_TOKEN = Deno.env.get('QSTASH_TOKEN')!

// Training level specific weather minimums
const TRAINING_LEVEL_MINIMUMS = {
  student_pilot: {
    visibility_miles: 5,
    ceiling_ft: 5000,
    wind_speed_knots: 10,
    crosswind_knots: 7,
    cloud_cover_percent: 25,
    special_restrictions: {
      no_thunderstorms: true,
      no_icing: true,
      clear_skies_required: true,
    }
  },
  private_pilot: {
    visibility_miles: 3,
    ceiling_ft: 1000,
    wind_speed_knots: 20,
    crosswind_knots: 15,
    cloud_cover_percent: 75,
    special_restrictions: {
      no_thunderstorms: true,
      no_icing: true,
      clear_skies_required: false,
    }
  },
  instrument_rated: {
    visibility_miles: 1,
    ceiling_ft: 200,
    wind_speed_knots: 30,
    crosswind_knots: 20,
    cloud_cover_percent: 100,
    special_restrictions: {
      no_thunderstorms: true,
      no_icing: true,
      clear_skies_required: false,
    }
  },
  commercial_pilot: {
    visibility_miles: 1,
    ceiling_ft: 200,
    wind_speed_knots: 35,
    crosswind_knots: 20,
    cloud_cover_percent: 100,
    special_restrictions: {
      no_thunderstorms: true,
      no_icing: true,
      clear_skies_required: false,
    }
  }
}

// Thunderstorm condition codes from WeatherAPI.com
const THUNDERSTORM_CODES = [1087, 1273, 1276, 1279, 1282]

interface WeatherData {
  airport: string
  timestamp: string
  visibility_miles: number
  ceiling_ft: number | null
  wind_speed_knots: number
  wind_direction_deg: number
  crosswind_knots: number
  cloud_cover_percent: number
  temp_f: number
  condition_code: number
  condition_text: string
  has_thunderstorm: boolean
  has_icing: boolean
  raw_data: any
}

interface Checkpoint {
  airport: string
  lat?: number
  lon?: number
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    console.log('🌤️  Weather Checker: Starting hourly check')
    
    // Fetch bookings scheduled in the next 3 hours
    const threeHoursFromNow = new Date()
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3)
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        student:student_id(id, email, full_name, training_level),
        instructor:instructor_id(id, email, full_name),
        aircraft:aircraft_id(*)
      `)
      .eq('status', 'scheduled')
      .lt('scheduled_start', threeHoursFromNow.toISOString())
      .gt('scheduled_start', new Date().toISOString())
    
    if (bookingsError) throw bookingsError
    
    if (!bookings || bookings.length === 0) {
      console.log('No bookings to check')
      return new Response(JSON.stringify({ message: 'No bookings to check' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    console.log(`Found ${bookings.length} bookings to check`)
    
    // Process each booking
    for (const booking of bookings) {
      try {
        await checkBookingWeather(supabase, booking)
      } catch (error) {
        console.error(`Error checking booking ${booking.id}:`, error)
        // Continue with next booking
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Weather check completed',
        bookingsChecked: bookings.length 
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Weather Checker Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function checkBookingWeather(supabase: any, booking: any) {
  console.log(`Checking weather for booking ${booking.id}`)
  
  // Determine checkpoints based on flight type
  const checkpoints = getCheckpoints(booking)
  console.log(`Checking ${checkpoints.length} locations:`, checkpoints.map(c => c.airport).join(', '))
  
  // Fetch weather for all checkpoints
  const weatherData: WeatherData[] = []
  for (const checkpoint of checkpoints) {
    const weather = await fetchWeather(supabase, checkpoint, booking.scheduled_start)
    weatherData.push(weather)
  }
  
  // Get training level minimums
  const trainingLevel = booking.student?.training_level || 'student_pilot'
  const minimums = TRAINING_LEVEL_MINIMUMS[trainingLevel as keyof typeof TRAINING_LEVEL_MINIMUMS]
  
  // Check for violations
  const violations = checkWeatherViolations(weatherData, minimums, booking.aircraft.minimum_weather_requirements)
  
  if (violations.length > 0) {
    console.log(`⚠️  Weather conflict detected for booking ${booking.id}:`, violations)
    
    // Create weather conflict record
    const { data: conflict, error: conflictError } = await supabase
      .from('weather_conflicts')
      .insert({
        booking_id: booking.id,
        detected_at: new Date().toISOString(),
        status: 'detected',
        weather_data: weatherData,
        conflict_reasons: violations
      })
      .select()
      .single()
    
    if (conflictError) throw conflictError
    
    // Update booking status
    await supabase
      .from('bookings')
      .update({ 
        status: 'weather_hold',
        last_weather_check: new Date().toISOString(),
        weather_snapshot: weatherData
      })
      .eq('id', booking.id)
    
    // Trigger AI rescheduler via QStash
    await triggerAIRescheduler(conflict.id)
    
    console.log(`✅ Created weather conflict ${conflict.id} and triggered AI rescheduler`)
  } else {
    // Update last weather check
    await supabase
      .from('bookings')
      .update({ 
        last_weather_check: new Date().toISOString(),
        weather_snapshot: weatherData
      })
      .eq('id', booking.id)
    
    console.log(`✅ Weather OK for booking ${booking.id}`)
  }
}

function getCheckpoints(booking: any): Checkpoint[] {
  const checkpoints: Checkpoint[] = [
    { airport: booking.departure_airport }
  ]
  
  // Add destination for cross-country flights
  if (booking.destination_airport) {
    if (booking.flight_type === 'short_xc') {
      // 2 points: departure + destination
      checkpoints.push({ airport: booking.destination_airport })
    } else if (booking.flight_type === 'long_xc') {
      // 3 points: departure + midpoint + destination
      // For now, add destination (midpoint calculation requires coordinates)
      checkpoints.push({ airport: booking.destination_airport })
      
      // If we have waypoints, use the middle one
      if (booking.route_waypoints && booking.route_waypoints.length > 0) {
        const midIdx = Math.floor(booking.route_waypoints.length / 2)
        checkpoints.splice(1, 0, booking.route_waypoints[midIdx])
      }
    }
  }
  
  return checkpoints
}

async function fetchWeather(
  supabase: any, 
  checkpoint: Checkpoint, 
  scheduledTime: string
): Promise<WeatherData> {
  const forecastTime = new Date(scheduledTime)
  
  // Check cache first
  const { data: cached } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('airport_code', checkpoint.airport)
    .eq('forecast_time', forecastTime.toISOString())
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (cached) {
    console.log(`Using cached weather for ${checkpoint.airport}`)
    return cached.weather_data
  }
  
  // Fetch from WeatherAPI.com
  console.log(`Fetching weather from API for ${checkpoint.airport}`)
  
  const url = `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${checkpoint.airport}&dt=${forecastTime.toISOString().split('T')[0]}&aqi=no&alerts=no`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  // Find the closest hour to scheduled time
  const scheduledHour = forecastTime.getHours()
  const hourData = data.forecast.forecastday[0].hour.find((h: any) => 
    new Date(h.time).getHours() === scheduledHour
  ) || data.forecast.forecastday[0].hour[0]
  
  // Calculate crosswind component (simplified - uses 90° crosswind worst case)
  const windSpeedKnots = Math.round(hourData.wind_mph * 0.868976)
  const crosswindKnots = Math.round(windSpeedKnots * 0.7) // Simplified crosswind estimate
  
  // Check for icing conditions
  const hasIcing = checkIcingConditions(
    hourData.temp_f,
    hourData.cloud,
    hourData.precip_mm,
    hourData.humidity
  )
  
  const weatherData: WeatherData = {
    airport: checkpoint.airport,
    timestamp: hourData.time,
    visibility_miles: hourData.vis_miles,
    ceiling_ft: estimateCeiling(hourData.cloud),
    wind_speed_knots: windSpeedKnots,
    wind_direction_deg: hourData.wind_degree,
    crosswind_knots: crosswindKnots,
    cloud_cover_percent: hourData.cloud,
    temp_f: hourData.temp_f,
    condition_code: hourData.condition.code,
    condition_text: hourData.condition.text,
    has_thunderstorm: THUNDERSTORM_CODES.includes(hourData.condition.code),
    has_icing: hasIcing,
    raw_data: hourData
  }
  
  // Cache the weather data
  const expiresAt = new Date()
  expiresAt.setSeconds(expiresAt.getSeconds() + WEATHER_CACHE_TTL)
  
  await supabase
    .from('weather_cache')
    .insert({
      airport_code: checkpoint.airport,
      forecast_time: forecastTime.toISOString(),
      weather_data: weatherData,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    })
  
  return weatherData
}

function estimateCeiling(cloudCover: number): number | null {
  // Estimate ceiling based on cloud cover percentage
  // This is a simplification - actual ceiling requires sky condition data
  if (cloudCover < 12) return null // Clear (SKC)
  if (cloudCover < 25) return 10000 // Few (FEW)
  if (cloudCover < 50) return 5000 // Scattered (SCT)
  if (cloudCover < 87) return 3000 // Broken (BKN)
  return 1000 // Overcast (OVC)
}

function checkIcingConditions(
  tempF: number,
  cloudCover: number,
  precipMm: number,
  humidity: number
): boolean {
  // Icing occurs when temp ≤ 32°F AND visible moisture present
  if (tempF > 32) return false
  
  // Visible moisture = clouds > 50% OR precipitation OR humidity > 80%
  const visibleMoisture = cloudCover > 50 || precipMm > 0 || humidity > 80
  
  return visibleMoisture
}

function checkWeatherViolations(
  weatherData: WeatherData[],
  minimums: any,
  aircraftMinimums: any
): string[] {
  const violations: string[] = []
  
  // Check each checkpoint
  for (const weather of weatherData) {
    const location = weather.airport
    
    // Check visibility
    if (weather.visibility_miles < minimums.visibility_miles) {
      violations.push(
        `Visibility at ${location}: ${weather.visibility_miles}mi (min: ${minimums.visibility_miles}mi)`
      )
    }
    
    // Check ceiling
    if (weather.ceiling_ft !== null && weather.ceiling_ft < minimums.ceiling_ft) {
      violations.push(
        `Ceiling at ${location}: ${weather.ceiling_ft}ft (min: ${minimums.ceiling_ft}ft)`
      )
    }
    
    // Check wind speed
    if (weather.wind_speed_knots > minimums.wind_speed_knots) {
      violations.push(
        `Wind at ${location}: ${weather.wind_speed_knots}kts (max: ${minimums.wind_speed_knots}kts)`
      )
    }
    
    // Check crosswind
    if (weather.crosswind_knots > minimums.crosswind_knots) {
      violations.push(
        `Crosswind at ${location}: ${weather.crosswind_knots}kts (max: ${minimums.crosswind_knots}kts)`
      )
    }
    
    // Check cloud cover
    if (weather.cloud_cover_percent > minimums.cloud_cover_percent) {
      violations.push(
        `Cloud cover at ${location}: ${weather.cloud_cover_percent}% (max: ${minimums.cloud_cover_percent}%)`
      )
    }
    
    // Check thunderstorms
    if (minimums.special_restrictions.no_thunderstorms && weather.has_thunderstorm) {
      violations.push(
        `Thunderstorms detected at ${location}: ${weather.condition_text}`
      )
    }
    
    // Check icing
    if (minimums.special_restrictions.no_icing && weather.has_icing) {
      violations.push(
        `Icing conditions at ${location}: Temp ${weather.temp_f}°F with visible moisture`
      )
    }
    
    // Check clear skies requirement
    if (minimums.special_restrictions.clear_skies_required) {
      if (weather.cloud_cover_percent >= 25 || (weather.ceiling_ft !== null && weather.ceiling_ft <= 5000)) {
        violations.push(
          `Clear skies required at ${location}: ${weather.cloud_cover_percent}% cloud cover`
        )
      }
    }
  }
  
  return violations
}

async function triggerAIRescheduler(conflictId: string) {
  const qstashUrl = 'https://qstash.upstash.io/v2/publish'
  const targetUrl = `${SUPABASE_URL}/functions/v1/ai-rescheduler`
  
  const response = await fetch(`${qstashUrl}/${targetUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conflict_id: conflictId })
  })
  
  if (!response.ok) {
    console.error('Failed to trigger AI rescheduler:', await response.text())
  }
}

