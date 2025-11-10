import type { Database } from '@/lib/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type RescheduleProposal = Database['public']['Tables']['reschedule_proposals']['Row']
type User = Database['public']['Tables']['users']['Row']
type Aircraft = Database['public']['Tables']['aircraft']['Row']
type WeatherConflict = {
  id: string
  booking_id: string
  detected_at: string
  severity: 'low' | 'medium' | 'high'
  wind_speed?: number
  visibility?: number
  conditions: string
}

export const mockUsers = {
  student: {
    id: 'student-1',
    email: 'student@test.com',
    name: 'Test Student',
    role: 'student',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  } as User,
  instructor: {
    id: 'instructor-1',
    email: 'instructor@test.com',
    name: 'Test Instructor',
    role: 'instructor',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  } as User,
  admin: {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  } as User,
}

export const mockAircraft: Aircraft = {
  id: 'aircraft-1',
  registration: 'N12345',
  model: 'Cessna 172',
  status: 'available',
  hourly_rate: 150,
  created_at: '2024-01-01T00:00:00Z',
}

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    student_id: mockUsers.student.id,
    instructor_id: mockUsers.instructor.id,
    aircraft_id: mockAircraft.id,
    start_time: '2024-12-15T10:00:00Z',
    end_time: '2024-12-15T12:00:00Z',
    status: 'confirmed',
    lesson_type: 'flight_training',
    created_at: '2024-01-01T00:00:00Z',
    notes: null,
    departure_airport: null,
    arrival_airport: null,
  },
  {
    id: 'booking-2',
    student_id: mockUsers.student.id,
    instructor_id: mockUsers.instructor.id,
    aircraft_id: mockAircraft.id,
    start_time: '2024-12-20T14:00:00Z',
    end_time: '2024-12-20T16:00:00Z',
    status: 'pending',
    lesson_type: 'ground_school',
    created_at: '2024-01-01T00:00:00Z',
    notes: null,
    departure_airport: null,
    arrival_airport: null,
  },
  {
    id: 'booking-3',
    student_id: mockUsers.student.id,
    instructor_id: mockUsers.instructor.id,
    aircraft_id: mockAircraft.id,
    start_time: '2024-12-25T09:00:00Z',
    end_time: '2024-12-25T11:00:00Z',
    status: 'confirmed',
    lesson_type: 'flight_training',
    created_at: '2024-01-01T00:00:00Z',
    notes: 'Weather sensitive',
    departure_airport: null,
    arrival_airport: null,
  },
]

export const mockProposals: RescheduleProposal[] = [
  {
    id: 'proposal-1',
    booking_id: mockBookings[0].id,
    proposed_by: mockUsers.instructor.id,
    proposed_start_time: '2024-12-15T14:00:00Z',
    proposed_end_time: '2024-12-15T16:00:00Z',
    reason: 'Weather concerns',
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
    resolved_at: null,
    resolved_by: null,
  },
  {
    id: 'proposal-2',
    booking_id: mockBookings[2].id,
    proposed_by: mockUsers.instructor.id,
    proposed_start_time: '2024-12-26T09:00:00Z',
    proposed_end_time: '2024-12-26T11:00:00Z',
    reason: 'Aircraft maintenance',
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
    resolved_at: null,
    resolved_by: null,
  },
]

export const mockWeatherConflicts: WeatherConflict[] = [
  {
    id: 'weather-1',
    booking_id: mockBookings[0].id,
    detected_at: '2024-12-14T00:00:00Z',
    severity: 'high',
    wind_speed: 25,
    visibility: 2,
    conditions: 'Strong winds and low visibility',
  },
  {
    id: 'weather-2',
    booking_id: mockBookings[2].id,
    detected_at: '2024-12-24T00:00:00Z',
    severity: 'medium',
    wind_speed: 18,
    visibility: 4,
    conditions: 'Moderate winds',
  },
]

// Helper functions to create custom mock data
export function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    ...mockBookings[0],
    id: `booking-${Date.now()}`,
    ...overrides,
  }
}

export function createMockProposal(overrides: Partial<RescheduleProposal> = {}): RescheduleProposal {
  return {
    ...mockProposals[0],
    id: `proposal-${Date.now()}`,
    ...overrides,
  }
}

export function createMockWeatherConflict(overrides: Partial<WeatherConflict> = {}): WeatherConflict {
  return {
    ...mockWeatherConflicts[0],
    id: `weather-${Date.now()}`,
    ...overrides,
  }
}

