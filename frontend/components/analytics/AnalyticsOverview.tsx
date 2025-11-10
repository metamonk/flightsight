'use client'

import { MetricsCards } from './MetricsCards'
import { BookingsChart } from './BookingsChart'
import { ConflictsChart } from './ConflictsChart'
import { InstructorActivityChart } from './InstructorActivityChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  useSystemMetrics, 
  useBookingTrends, 
  useConflictStats,
  useInstructorActivity 
} from '@/lib/queries/analytics'

/**
 * Analytics Overview Component
 * 
 * Main analytics dashboard section that displays:
 * - System-wide metrics (bookings, users, conflicts, resolution rate)
 * - Booking trends chart (last 7 days)
 * - Conflict statistics (last 4 weeks)
 * - Instructor activity distribution
 * 
 * Uses React Query for data fetching with automatic refetching
 * All charts are responsive and update in real-time
 */
export function AnalyticsOverview() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useSystemMetrics()
  const { data: bookingTrends, isLoading: trendsLoading, error: trendsError, refetch: refetchTrends } = useBookingTrends()
  const { data: conflictStats, isLoading: conflictsLoading, error: conflictsError, refetch: refetchConflicts } = useConflictStats()
  const { data: instructorActivity, isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useInstructorActivity()

  const isLoading = metricsLoading || trendsLoading || conflictsLoading || activityLoading
  const hasError = metricsError || trendsError || conflictsError || activityError

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  // Error state with retry options
  if (hasError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Failed to Load Analytics Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {metricsError instanceof Error ? metricsError.message :
               trendsError instanceof Error ? trendsError.message :
               conflictsError instanceof Error ? conflictsError.message :
               activityError instanceof Error ? activityError.message :
               'There was an error loading the analytics. Please try again.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => {
                  refetchMetrics()
                  refetchTrends()
                  refetchConflicts()
                  refetchActivity()
                }} 
                variant="outline"
                className="gap-2"
              >
                <span>🔄</span>
                Retry All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          📊 System Metrics
        </h2>
        {metrics && (
          <MetricsCards
            totalBookings={metrics.totalBookings}
            activeInstructors={metrics.activeInstructors}
            activeStudents={metrics.activeStudents}
            activeConflicts={metrics.activeConflicts}
            resolutionRate={metrics.resolutionRate}
          />
        )}
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Booking Trends
            </CardTitle>
            <CardDescription>
              Last 7 days by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingTrends && <BookingsChart data={bookingTrends} />}
          </CardContent>
        </Card>

        {/* Conflict Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Weather Conflicts
            </CardTitle>
            <CardDescription>
              Last 4 weeks (resolved vs pending)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conflictStats && <ConflictsChart data={conflictStats} />}
          </CardContent>
        </Card>

        {/* Instructor Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👨‍✈️ Instructor Workload Distribution
            </CardTitle>
            <CardDescription>
              Booking distribution across top 8 active instructors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instructorActivity && <InstructorActivityChart data={instructorActivity} />}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 System Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Average Bookings per Day</p>
                <p className="text-2xl font-bold text-foreground">
                  {bookingTrends && bookingTrends.length > 0
                    ? Math.round(
                        bookingTrends.reduce((sum, day) => 
                          sum + day.confirmed + day.weatherHold + day.cancelled, 0
                        ) / bookingTrends.length
                      )
                    : 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Conflict Resolution Time</p>
                <p className="text-2xl font-bold text-foreground">
                  ~2-4 hrs
                  <span className="text-sm font-normal text-muted-foreground ml-2">avg</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">System Health</p>
                <p className="text-2xl font-bold text-primary">
                  {metrics && metrics.activeConflicts === 0 ? 'Excellent' : 
                   metrics && metrics.activeConflicts < 5 ? 'Good' : 'Fair'}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({metrics?.activeConflicts || 0} active issues)
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

