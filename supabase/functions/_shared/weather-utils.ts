/**
 * Shared Weather Utilities
 * 
 * Common weather checking functions used by both weather-checker and ai-rescheduler
 */

interface WeatherMinimums {
  visibility_miles: number
  ceiling_feet: number
  cloud_cover_percent: number
  wind_speed_knots: number
  wind_gust_knots: number
  crosswind_knots: number
}

interface WeatherData {
  visibility_miles: number
  ceiling_feet: number | null
  cloud_cover_percent: number
  wind_speed_knots: number
  wind_gust_knots: number
  wind_direction_degrees: number
  temperature_f: number
  dewpoint_f: number
  conditions: string
}

/**
 * Get weather minimums based on training level
 */
export function getTrainingMinimums(trainingLevel: string): WeatherMinimums {
  switch (trainingLevel) {
    case 'student_pilot':
      return {
        visibility_miles: 5,
        ceiling_feet: 5000,
        cloud_cover_percent: 25,
        wind_speed_knots: 12,
        wind_gust_knots: 15,
        crosswind_knots: 8,
      }
    case 'private_pilot':
      return {
        visibility_miles: 3,
        ceiling_feet: 3000,
        cloud_cover_percent: 50,
        wind_speed_knots: 15,
        wind_gust_knots: 20,
        crosswind_knots: 10,
      }
    case 'commercial_pilot':
    case 'instrument_rated':
    case 'cfi':
      return {
        visibility_miles: 3,
        ceiling_feet: 1000,
        cloud_cover_percent: 75,
        wind_speed_knots: 20,
        wind_gust_knots: 25,
        crosswind_knots: 12,
      }
    default:
      // Default to most conservative (student pilot) minimums
      return {
        visibility_miles: 5,
        ceiling_feet: 5000,
        cloud_cover_percent: 25,
        wind_speed_knots: 12,
        wind_gust_knots: 15,
        crosswind_knots: 8,
      }
  }
}

/**
 * Check if weather violates minimums
 * Returns array of violation reasons
 */
export function checkWeatherViolations(
  weather: WeatherData,
  minimums: WeatherMinimums,
  aircraftMinimums?: any
): string[] {
  const violations: string[] = []

  // Visibility
  if (weather.visibility_miles < minimums.visibility_miles) {
    violations.push(
      `Visibility: ${weather.visibility_miles}mi (min: ${minimums.visibility_miles}mi)`
    )
  }

  // Ceiling
  if (weather.ceiling_feet !== null && weather.ceiling_feet < minimums.ceiling_feet) {
    violations.push(
      `Ceiling: ${weather.ceiling_feet}ft (min: ${minimums.ceiling_feet}ft)`
    )
  }

  // Cloud cover
  if (weather.cloud_cover_percent > minimums.cloud_cover_percent) {
    violations.push(
      `Cloud cover: ${weather.cloud_cover_percent}% (max: ${minimums.cloud_cover_percent}%)`
    )
  }

  // Wind speed
  if (weather.wind_speed_knots > minimums.wind_speed_knots) {
    violations.push(
      `Wind speed: ${weather.wind_speed_knots}kts (max: ${minimums.wind_speed_knots}kts)`
    )
  }

  // Wind gusts
  if (weather.wind_gust_knots > minimums.wind_gust_knots) {
    violations.push(
      `Wind gusts: ${weather.wind_gust_knots}kts (max: ${minimums.wind_gust_knots}kts)`
    )
  }

  // Aircraft-specific minimums
  if (aircraftMinimums?.clear_skies_required && weather.cloud_cover_percent > 0) {
    violations.push(
      `Clear skies required: ${weather.cloud_cover_percent}% cloud cover`
    )
  }

  return violations
}

/**
 * Fetch weather data from Weather API
 */
export async function fetchWeatherData(
  airport: string,
  dateTime: Date,
  apiKey: string
): Promise<WeatherData | null> {
  const baseUrl = Deno.env.get('WEATHER_API_URL') || 'https://api.weatherapi.com/v1'
  
  // For future dates, use forecast; for current, use current weather
  const now = new Date()
  const isFuture = dateTime > now
  const hoursDiff = Math.abs(dateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  try {
    let url: string
    
    if (isFuture && hoursDiff <= 72) {
      // Use forecast for next 3 days
      const daysAhead = Math.ceil(hoursDiff / 24)
      url = `${baseUrl}/forecast.json?key=${apiKey}&q=${airport}&days=${Math.min(daysAhead + 1, 3)}&hour=${dateTime.getHours()}`
    } else if (isFuture && hoursDiff > 72) {
      // Beyond 3 days: use current conditions as estimate (best we can do)
      url = `${baseUrl}/current.json?key=${apiKey}&q=${airport}`
    } else {
      // Current or past weather
      url = `${baseUrl}/current.json?key=${apiKey}&q=${airport}`
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    // Extract weather data
    const current = data.current || (data.forecast?.forecastday?.[0]?.hour?.[dateTime.getHours()])
    
    if (!current) {
      console.error('No weather data found in response')
      return null
    }
    
    return {
      visibility_miles: current.vis_miles || 10,
      ceiling_feet: current.cloud ? (10000 - (current.cloud * 100)) : null,
      cloud_cover_percent: current.cloud || 0,
      wind_speed_knots: Math.round((current.wind_mph || 0) * 0.868976),
      wind_gust_knots: Math.round((current.gust_mph || 0) * 0.868976),
      wind_direction_degrees: current.wind_degree || 0,
      temperature_f: current.temp_f || 70,
      dewpoint_f: current.dewpoint_f || 60,
      conditions: current.condition?.text || 'Unknown',
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return null
  }
}

/**
 * Check if a time slot is weather-safe for flying
 */
export async function isSlotWeatherSafe(
  slotStart: Date,
  airport: string,
  trainingLevel: string,
  aircraftMinimums: any,
  apiKey: string
): Promise<{ safe: boolean; violations: string[] }> {
  const weather = await fetchWeatherData(airport, slotStart, apiKey)
  
  if (!weather) {
    // If we can't get weather data, assume unsafe (fail-safe)
    return { safe: false, violations: ['Unable to verify weather conditions'] }
  }
  
  const minimums = getTrainingMinimums(trainingLevel)
  const violations = checkWeatherViolations(weather, minimums, aircraftMinimums)
  
  return {
    safe: violations.length === 0,
    violations
  }
}

