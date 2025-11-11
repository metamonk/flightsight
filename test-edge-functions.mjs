#!/usr/bin/env node

/**
 * Test Edge Functions Script
 * 
 * This script tests the complete weather conflict workflow:
 * 1. Creates a test booking
 * 2. Invokes weather-checker
 * 3. Watches for real-time updates
 * 4. Invokes AI rescheduler
 * 5. Invokes notification sender
 * 
 * Usage:
 *   pnpm test:functions
 *   pnpm test:functions:cleanup
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables (try .env.local first, fallback to .env)
import { readFileSync } from 'fs'

const envPath = join(__dirname, 'frontend', '.env.local')
const envPathFallback = join(__dirname, 'frontend', '.env')

let envFile
try {
  envFile = readFileSync(envPath, 'utf8')
} catch {
  try {
    envFile = readFileSync(envPathFallback, 'utf8')
  } catch (error) {
    console.error('❌ No .env or .env.local file found in frontend/')
    process.exit(1)
  }
}

// Parse environment variables manually
const envVars = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1')
    envVars[key] = value
    process.env[key] = value
  }
})

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`),
  data: (label, value) => console.log(`  ${colors.dim}${label}:${colors.reset} ${value}`),
}

// Store test data for cleanup
let testBookingId = null
let testConflictId = null

async function cleanup() {
  log.step('Cleaning up test data')
  
  try {
    // Delete test weather conflicts
    const { data: conflicts } = await supabase
      .from('weather_conflicts')
      .select('id')
      .gte('detected_at', new Date(Date.now() - 3600000).toISOString())
    
    if (conflicts && conflicts.length > 0) {
      const { error: deleteConflictsError } = await supabase
        .from('weather_conflicts')
        .delete()
        .in('id', conflicts.map(c => c.id))
      
      if (deleteConflictsError) throw deleteConflictsError
      log.success(`Deleted ${conflicts.length} test weather conflicts`)
    }
    
    // Delete test bookings (recent with weather_hold status)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('status', 'weather_hold')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
    if (bookings && bookings.length > 0) {
      const { error: deleteBookingsError } = await supabase
        .from('bookings')
        .delete()
        .in('id', bookings.map(b => b.id))
      
      if (deleteBookingsError) throw deleteBookingsError
      log.success(`Deleted ${bookings.length} test bookings`)
    }
    
    // Delete test notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
    if (notifications && notifications.length > 0) {
      const { error: deleteNotificationsError } = await supabase
        .from('notifications')
        .delete()
        .in('id', notifications.map(n => n.id))
      
      if (deleteNotificationsError) throw deleteNotificationsError
      log.success(`Deleted ${notifications.length} test notifications`)
    }
    
    log.success('Cleanup complete!')
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`)
  }
}

async function getTestUsers() {
  log.step('Finding test users')
  
  // Get a student
  const { data: students, error: studentError } = await supabase
    .from('users')
    .select('id, full_name, email, training_level')
    .eq('role', 'student')
    .limit(1)
  
  if (studentError) throw studentError
  if (!students || students.length === 0) {
    throw new Error('No student users found. Please create a test student user first.')
  }
  
  const student = students[0]
  log.data('Student', `${student.full_name} (${student.email})`)
  log.data('Training Level', student.training_level || 'student_pilot')
  
  // Get an instructor
  const { data: instructors, error: instructorError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('role', 'instructor')
    .limit(1)
  
  if (instructorError) throw instructorError
  if (!instructors || instructors.length === 0) {
    throw new Error('No instructor users found. Please create a test instructor user first.')
  }
  
  const instructor = instructors[0]
  log.data('Instructor', `${instructor.full_name} (${instructor.email})`)
  
  // Get test aircraft
  const { data: aircraft, error: aircraftError } = await supabase
    .from('aircraft')
    .select('id, tail_number, make, model')
    .eq('is_active', true)
    .limit(1)
  
  if (aircraftError) throw aircraftError
  if (!aircraft || aircraft.length === 0) {
    throw new Error('No active aircraft found. Please create test aircraft first.')
  }
  
  const plane = aircraft[0]
  log.data('Aircraft', `${plane.tail_number} - ${plane.make} ${plane.model}`)
  
  return { student, instructor, aircraft: plane }
}

async function createTestBooking(studentId, instructorId, aircraftId) {
  log.step('Creating test booking')
  
  const scheduledStart = new Date()
  scheduledStart.setHours(scheduledStart.getHours() + 2) // 2 hours from now
  
  const scheduledEnd = new Date(scheduledStart)
  scheduledEnd.setHours(scheduledEnd.getHours() + 2) // 2 hour lesson
  
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      student_id: studentId,
      instructor_id: instructorId,
      aircraft_id: aircraftId,
      departure_airport: 'KSFO',
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      status: 'scheduled',
      lesson_type: 'Pattern Work - TEST',
      lesson_notes: '🧪 Automated test booking - will be deleted',
      flight_type: 'local'
    })
    .select()
    .single()
  
  if (error) throw error
  
  testBookingId = booking.id
  log.success(`Created booking ${booking.id}`)
  log.data('Departure', booking.departure_airport)
  log.data('Scheduled', new Date(booking.scheduled_start).toLocaleString())
  
  return booking
}

async function invokeWeatherChecker() {
  log.step('Invoking weather-checker function')
  
  const { data, error } = await supabase.functions.invoke('weather-checker', {
    method: 'POST'
  })
  
  if (error) {
    log.error(`Weather checker failed: ${error.message}`)
    return null
  }
  
  log.success('Weather checker completed')
  log.data('Result', JSON.stringify(data, null, 2))
  
  // Wait a bit for the data to propagate
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return data
}

async function checkForConflict(bookingId) {
  log.step('Checking for weather conflict')
  
  const { data: conflicts, error } = await supabase
    .from('weather_conflicts')
    .select('*')
    .eq('booking_id', bookingId)
    .order('detected_at', { ascending: false })
    .limit(1)
  
  if (error) throw error
  
  if (!conflicts || conflicts.length === 0) {
    log.warning('No weather conflict detected (weather may be good at KSFO)')
    log.info('This is expected if current weather is within minimums')
    return null
  }
  
  const conflict = conflicts[0]
  testConflictId = conflict.id
  
  log.success(`Weather conflict detected: ${conflict.id}`)
  log.data('Status', conflict.status)
  log.data('Violations', conflict.conflict_reasons.length)
  
  console.log(`\n${colors.yellow}Weather Violations:${colors.reset}`)
  conflict.conflict_reasons.forEach((reason, i) => {
    console.log(`  ${i + 1}. ${reason}`)
  })
  
  return conflict
}

async function invokeAIRescheduler(conflictId) {
  log.step('Invoking AI rescheduler function')
  
  const { data, error } = await supabase.functions.invoke('ai-rescheduler', {
    method: 'POST',
    body: { conflict_id: conflictId }
  })
  
  if (error) {
    log.error(`AI rescheduler failed: ${error.message}`)
    return null
  }
  
  log.success('AI rescheduler completed')
  log.data('Result', JSON.stringify(data, null, 2))
  
  // Wait for proposals to be created
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return data
}

async function checkProposals(conflictId) {
  log.step('Checking reschedule proposals')
  
  const { data: proposals, error } = await supabase
    .from('reschedule_proposals')
    .select('*')
    .eq('conflict_id', conflictId)
    .order('score', { ascending: false })
  
  if (error) throw error
  
  if (!proposals || proposals.length === 0) {
    log.warning('No proposals generated')
    return []
  }
  
  log.success(`Generated ${proposals.length} reschedule proposals`)
  
  console.log(`\n${colors.cyan}Proposals:${colors.reset}`)
  proposals.forEach((proposal, i) => {
    console.log(`\n  ${i + 1}. Score: ${(proposal.score * 100).toFixed(0)}%`)
    console.log(`     Time: ${new Date(proposal.proposed_start).toLocaleString()}`)
    console.log(`     Status: ${proposal.availability_status}`)
    console.log(`     Reasoning: ${proposal.reasoning}`)
  })
  
  return proposals
}

async function invokeNotificationSender(conflictId) {
  log.step('Invoking notification sender function')
  
  const { data, error } = await supabase.functions.invoke('notification-sender', {
    method: 'POST',
    body: { conflict_id: conflictId }
  })
  
  if (error) {
    log.error(`Notification sender failed: ${error.message}`)
    return null
  }
  
  log.success('Notifications sent')
  log.data('Result', JSON.stringify(data, null, 2))
  
  return data
}

async function checkNotifications(studentId, instructorId) {
  log.step('Checking notifications')
  
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .in('user_id', [studentId, instructorId])
    .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  if (!notifications || notifications.length === 0) {
    log.warning('No notifications found')
    return []
  }
  
  log.success(`Found ${notifications.length} notifications`)
  
  console.log(`\n${colors.magenta}Notifications:${colors.reset}`)
  notifications.forEach((notif, i) => {
    const recipient = notif.user_id === studentId ? 'Student' : 'Instructor'
    console.log(`\n  ${i + 1}. ${recipient} - ${notif.type}`)
    console.log(`     Title: ${notif.title}`)
    console.log(`     Message: ${notif.message}`)
    console.log(`     Status: ${notif.status}`)
  })
  
  return notifications
}

async function watchRealtimeUpdates(bookingId, studentId, instructorId, duration = 10000) {
  log.step(`Watching for real-time updates (${duration / 1000}s)`)
  
  const channels = []
  
  // Subscribe to booking changes
  const bookingChannel = supabase
    .channel('test-bookings')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'bookings',
      filter: `id=eq.${bookingId}`
    }, (payload) => {
      log.info(`📡 Booking updated: status=${payload.new.status}`)
    })
    .subscribe()
  
  channels.push(bookingChannel)
  
  // Subscribe to weather conflicts
  const conflictChannel = supabase
    .channel('test-conflicts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'weather_conflicts',
      filter: `booking_id=eq.${bookingId}`
    }, (payload) => {
      log.info(`📡 Weather conflict created: ${payload.new.id}`)
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'weather_conflicts',
      filter: `booking_id=eq.${bookingId}`
    }, (payload) => {
      log.info(`📡 Weather conflict updated: status=${payload.new.status}`)
    })
    .subscribe()
  
  channels.push(conflictChannel)
  
  // Subscribe to notifications
  const notificationChannel = supabase
    .channel('test-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=in.(${studentId},${instructorId})`
    }, (payload) => {
      log.info(`📡 Notification received: ${payload.new.type} - "${payload.new.title}"`)
    })
    .subscribe()
  
  channels.push(notificationChannel)
  
  // Wait for specified duration
  await new Promise(resolve => setTimeout(resolve, duration))
  
  // Cleanup subscriptions
  for (const channel of channels) {
    await supabase.removeChannel(channel)
  }
  
  log.success('Real-time monitoring complete')
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}`)
  console.log('╔════════════════════════════════════════════╗')
  console.log('║   FlightSight Edge Functions Test Suite   ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log(colors.reset)
  
  try {
    // Check for cleanup flag
    if (process.argv.includes('--cleanup')) {
      await cleanup()
      return
    }
    
    // Get test users and aircraft
    const { student, instructor, aircraft } = await getTestUsers()
    
    // Create test booking
    const booking = await createTestBooking(student.id, instructor.id, aircraft.id)
    
    // Start real-time monitoring in background
    const realtimePromise = watchRealtimeUpdates(booking.id, student.id, instructor.id, 30000)
    
    // Invoke weather checker
    await invokeWeatherChecker()
    
    // Check if conflict was created
    const conflict = await checkForConflict(booking.id)
    
    if (conflict) {
      // Invoke AI rescheduler
      await invokeAIRescheduler(conflict.id)
      
      // Check proposals
      await checkProposals(conflict.id)
      
      // Invoke notification sender
      await invokeNotificationSender(conflict.id)
      
      // Check notifications
      await checkNotifications(student.id, instructor.id)
    } else {
      log.info('Skipping AI rescheduler and notifications (no conflict)')
      log.info('You can manually create a conflict using the SQL script')
    }
    
    // Wait for real-time monitoring to complete
    await realtimePromise
    
    console.log(`\n${colors.green}${colors.bright}`)
    console.log('╔════════════════════════════════════════════╗')
    console.log('║          ✓ Test Complete!                 ║')
    console.log('╚════════════════════════════════════════════╝')
    console.log(colors.reset)
    
    log.info('Next steps:')
    console.log('  1. Open your browser to the student dashboard')
    console.log('  2. Check the calendar for weather conflicts')
    console.log('  3. Check notifications')
    console.log('  4. Review booking details')
    console.log('\nTo clean up test data:')
    console.log('  pnpm test:functions:cleanup')
    
  } catch (error) {
    log.error(`Test failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

main()

