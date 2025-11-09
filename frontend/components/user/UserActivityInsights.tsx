'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Target,
  XCircle,
  BarChart3,
  Clock
} from 'lucide-react'

interface UserActivityInsightsProps {
  stats: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    upcomingBookings: number
    totalHours: number
    accountAgeDays: number
    daysSinceLastLogin: number | null
    bookingsPerMonth: number
    recentBookings: number
    completionRate: number
    cancellationRate: number
    monthlyBookings: Array<{ month: string; count: number }>
  } | undefined
  isLoading: boolean
}

/**
 * UserActivityInsights Component
 * 
 * Displays comprehensive user activity statistics and insights
 * 
 * Features:
 * - Activity metrics (login frequency, recent activity)
 * - Performance metrics (completion/cancellation rates)
 * - Booking trends (monthly patterns)
 * - Visual indicators and badges
 * - Loading states
 * 
 * Task 24.8
 */
export function UserActivityInsights({ stats, isLoading }: UserActivityInsightsProps) {
  if (isLoading || !stats) {
    return null
  }

  // Format account age
  const formatAccountAge = (days: number) => {
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.floor(days / 30)} months`
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    return months > 0 ? `${years}y ${months}m` : `${years} years`
  }

  // Format last login
  const formatLastLogin = (days: number | null) => {
    if (days === null) return 'Never logged in'
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  // Determine activity level
  const getActivityLevel = () => {
    if (stats.recentBookings >= 4) return { label: 'Very Active', color: 'bg-green-500', textColor: 'text-green-600' }
    if (stats.recentBookings >= 2) return { label: 'Active', color: 'bg-blue-500', textColor: 'text-blue-600' }
    if (stats.recentBookings >= 1) return { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    return { label: 'Inactive', color: 'bg-gray-400', textColor: 'text-gray-600' }
  }

  const activityLevel = getActivityLevel()

  // Determine if completion rate is good
  const getCompletionBadgeVariant = () => {
    if (stats.completionRate >= 80) return 'default'
    if (stats.completionRate >= 60) return 'secondary'
    return 'destructive'
  }

  // Calculate trend indicator
  const getTrendIndicator = () => {
    if (stats.monthlyBookings.length < 2) return null
    const current = stats.monthlyBookings[stats.monthlyBookings.length - 1].count
    const previous = stats.monthlyBookings[stats.monthlyBookings.length - 2].count
    
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500', label: 'Increasing' }
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500', label: 'Decreasing' }
    return { icon: Activity, color: 'text-blue-500', label: 'Stable' }
  }

  const trend = getTrendIndicator()

  return (
    <div className="space-y-6">
      {/* Activity Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Activity Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${activityLevel.color}`} />
              <div>
                <p className="text-sm font-medium">Activity Level</p>
                <p className="text-xs text-muted-foreground">{stats.recentBookings} bookings in last 30 days</p>
              </div>
            </div>
            <Badge variant="secondary" className={activityLevel.textColor}>
              {activityLevel.label}
            </Badge>
          </div>

          <Separator />

          {/* Account Age & Last Login */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Account Age</p>
                <p className="text-sm font-medium">{formatAccountAge(stats.accountAgeDays)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium">{formatLastLogin(stats.daysSinceLastLogin)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Frequency */}
          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Booking Frequency</p>
              <p className="text-sm font-medium">{stats.bookingsPerMonth} bookings/month average</p>
            </div>
            {trend && (
              <div className="flex items-center gap-1">
                <trend.icon className={`h-4 w-4 ${trend.color}`} />
                <span className={`text-xs font-medium ${trend.color}`}>{trend.label}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Completion Rate</p>
              <Badge variant={getCompletionBadgeVariant()}>
                {stats.completionRate}%
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedBookings} of {stats.totalBookings} bookings completed
            </p>
          </div>

          <Separator />

          {/* Cancellation Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Cancellation Rate</p>
              <Badge variant={stats.cancellationRate > 20 ? 'destructive' : 'secondary'}>
                {stats.cancellationRate}%
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive transition-all"
                style={{ width: `${stats.cancellationRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {stats.cancelledBookings} of {stats.totalBookings} bookings cancelled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Trends Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Booking Trends (Last 3 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.monthlyBookings.map((month, index) => {
              const maxCount = Math.max(...stats.monthlyBookings.map(m => m.count))
              const barWidth = maxCount > 0 ? (month.count / maxCount) * 100 : 0
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{month.month}</span>
                    <span className="font-medium">{month.count} bookings</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {stats.monthlyBookings.every(m => m.count === 0) && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No bookings in the last 3 months</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

