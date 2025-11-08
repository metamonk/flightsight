'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface StatusFilter {
  confirmed: boolean
  weatherHold: boolean
  cancelled: boolean
  rescheduling: boolean
}

export interface FilterState {
  dateRange: DateRangeFilter
  status: StatusFilter
  searchQuery: string
}

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

const defaultFilters: FilterState = {
  dateRange: {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  },
  status: {
    confirmed: true,
    weatherHold: true,
    cancelled: false,
    rescheduling: true,
  },
  searchQuery: '',
}

const statusColors = {
  confirmed: 'bg-primary',
  weatherHold: 'bg-secondary',
  cancelled: 'bg-destructive',
  rescheduling: 'bg-accent',
}

/**
 * Dashboard Filters Component
 * 
 * Provides filtering UI for admin dashboard data
 * Supports date ranges, status filters, and search
 */
export function DashboardFilters({ onFilterChange, initialFilters }: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  })

  const handleFilterChange = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleStatusToggle = (status: keyof StatusFilter) => {
    handleFilterChange({
      status: {
        ...filters.status,
        [status]: !filters.status[status],
      },
    })
  }

  const handlePresetRange = (days: number) => {
    handleFilterChange({
      dateRange: {
        startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      },
    })
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
          >
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by student, instructor, aircraft..."
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.dateRange.startDate}
                onChange={(e) =>
                  handleFilterChange({
                    dateRange: { ...filters.dateRange, startDate: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={filters.dateRange.endDate}
                onChange={(e) =>
                  handleFilterChange({
                    dateRange: { ...filters.dateRange, endDate: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handlePresetRange(7)}
              variant="outline"
              size="sm"
            >
              Last 7 days
            </Button>
            <Button
              onClick={() => handlePresetRange(30)}
              variant="outline"
              size="sm"
            >
              Last 30 days
            </Button>
            <Button
              onClick={() => handlePresetRange(90)}
              variant="outline"
              size="sm"
            >
              Last 90 days
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status.confirmed}
                onChange={() => handleStatusToggle('confirmed')}
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColors.confirmed}`} />
                Confirmed
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status.weatherHold}
                onChange={() => handleStatusToggle('weatherHold')}
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColors.weatherHold}`} />
                Weather Hold
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status.rescheduling}
                onChange={() => handleStatusToggle('rescheduling')}
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColors.rescheduling}`} />
                Rescheduling
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status.cancelled}
                onChange={() => handleStatusToggle('cancelled')}
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
              />
              <span className="text-sm flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColors.cancelled}`} />
                Cancelled
              </span>
            </label>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="pt-4 border-t">
          <Badge variant="secondary">
            {Object.values(filters.status).filter(Boolean).length} status filters active
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Apply filters to booking data
 */
export function applyFilters(bookings: any[], filters: FilterState) {
  let filtered = [...bookings]

  // Date range filter
  if (filters.dateRange.startDate && filters.dateRange.endDate) {
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.scheduled_start)
      const start = new Date(filters.dateRange.startDate)
      const end = new Date(filters.dateRange.endDate)
      return bookingDate >= start && bookingDate <= end
    })
  }

  // Status filter
  const activeStatuses = Object.entries(filters.status)
    .filter(([_, isActive]) => isActive)
    .map(([status]) => {
      // Convert camelCase to snake_case
      return status === 'weatherHold' ? 'weather_hold' : status
    })

  if (activeStatuses.length > 0) {
    filtered = filtered.filter(booking =>
      activeStatuses.includes(booking.status)
    )
  }

  // Search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(booking => {
      const studentEmail = booking.student?.email?.toLowerCase() || ''
      const instructorEmail = booking.instructor?.email?.toLowerCase() || ''
      const aircraft = booking.aircraft?.registration?.toLowerCase() || ''
      
      return (
        studentEmail.includes(query) ||
        instructorEmail.includes(query) ||
        aircraft.includes(query)
      )
    })
  }

  return filtered
}

