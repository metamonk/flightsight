'use client'

import { useState } from 'react'
import { AdminRealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { DashboardFilters, FilterState, applyFilters } from '@/components/analytics/DashboardFilters'
import { BookingsTable } from '@/components/analytics/BookingsTable'
import { useAdminBookings } from '@/lib/queries/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface AdminDashboardClientProps {
  // No props needed - admin sees system-wide data
}

/**
 * Admin Dashboard Client Component
 * 
 * Client-side portion of the admin dashboard with:
 * - Real-time subscription via AdminRealtimeProvider
 * - Interactive filtering and search
 * - Analytics overview section
 * - Detailed bookings table
 * - Tab-based navigation between views
 */
// Default date range (last 30 days)
const getDefaultDateRange = () => ({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
})

export function AdminDashboardClient({}: AdminDashboardClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getDefaultDateRange(),
    status: {
      confirmed: true,
      weatherHold: true,
      cancelled: false,
      rescheduling: true,
    },
    searchQuery: '',
  })

  const { data: bookings, isLoading: bookingsLoading } = useAdminBookings()

  const filteredBookings = bookings ? applyFilters(bookings, filters) : []

  return (
    <AdminRealtimeProvider>
      <div className="space-y-6">
        {/* Tab Navigation using shadcn Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              📊 Analytics Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              📅 All Bookings
              <Badge variant="secondary" className="ml-1">
                {filteredBookings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <AnalyticsOverview />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <DashboardFilters
                    onFilterChange={setFilters}
                    initialFilters={filters}
                  />
                </div>
              </div>

              {/* Bookings Table */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📅 All Bookings
                    </CardTitle>
                    <CardDescription>
                      Complete system-wide booking data with filtering
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <BookingsTable bookings={filteredBookings} loading={bookingsLoading} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Status Footer */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-foreground mr-2"></span>
                  System Operational
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                Real-time updates active
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminRealtimeProvider>
  )
}

