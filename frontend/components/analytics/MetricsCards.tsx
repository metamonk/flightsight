'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
}

/**
 * Metric Card Component
 * 
 * Displays a single key metric with icon, value, and optional trend indicator
 * Used in the admin dashboard for quick stats overview
 */
export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <Badge 
                  variant={trend.direction === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-2xl border border-primary/20">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricsCardsProps {
  totalBookings: number
  activeInstructors: number
  activeStudents: number
  activeConflicts: number
  resolutionRate: number
}

/**
 * Metrics Cards Container
 * 
 * Displays a grid of key system metrics for quick overview
 * Real-time updates from Supabase subscriptions
 */
export function MetricsCards({ 
  totalBookings, 
  activeInstructors, 
  activeStudents, 
  activeConflicts,
  resolutionRate 
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <MetricCard
        title="Total Bookings"
        value={totalBookings}
        subtitle="Active bookings"
        icon="📅"
      />
      <MetricCard
        title="Instructors"
        value={activeInstructors}
        subtitle="Active instructors"
        icon="👨‍✈️"
      />
      <MetricCard
        title="Students"
        value={activeStudents}
        subtitle="Active students"
        icon="🎓"
      />
      <MetricCard
        title="Conflicts"
        value={activeConflicts}
        subtitle="Pending resolution"
        icon="⚠️"
        variant={activeConflicts > 0 ? 'warning' : 'default'}
      />
      <MetricCard
        title="Resolution Rate"
        value={`${resolutionRate}%`}
        subtitle="Auto-resolved conflicts"
        icon="✅"
        variant={resolutionRate >= 80 ? 'default' : resolutionRate >= 50 ? 'warning' : 'destructive'}
      />
    </div>
  )
}

