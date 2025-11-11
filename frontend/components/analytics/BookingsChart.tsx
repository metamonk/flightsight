'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export interface BookingsChartData {
  date: string
  confirmed: number
  weatherHold: number
  cancelled: number
}

interface BookingsChartProps {
  data: BookingsChartData[]
}

// Lazy load Recharts components for better performance
const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  {
    loading: () => <Skeleton className="w-full h-[300px]" />,
    ssr: false,
  }
)

const LazyLine = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
)

const LazyXAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)

const LazyYAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)

const LazyCartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)

const LazyTooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)

const LazyLegend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend })) as any,
  { ssr: false }
)

const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

/**
 * Bookings Trend Chart
 * 
 * Visualizes booking trends over time, showing different statuses
 * Uses Recharts with lazy loading for optimal performance
 * Refactored to use theme-aware colors from CSS variables
 * Memoized to prevent unnecessary re-renders
 */
export const BookingsChart = memo(function BookingsChart({ data }: BookingsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No booking data available</p>
      </div>
    )
  }

  return (
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyLineChart data={data}>
        <LazyCartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <LazyXAxis 
          dataKey="date" 
          className="text-xs fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <LazyYAxis 
          className="text-xs fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <LazyTooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '8px',
            color: 'hsl(var(--card-foreground))'
          }}
        />
        <LazyLegend
          {...({ wrapperStyle: { fontSize: '12px', color: 'hsl(var(--foreground))' }, iconType: 'line' } as any)}
        />
        <LazyLine 
          type="monotone" 
          dataKey="confirmed" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--chart-1))' }}
          name="Confirmed"
        />
        <LazyLine 
          type="monotone" 
          dataKey="weatherHold" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--chart-2))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
          name="Weather Hold"
        />
        <LazyLine 
          type="monotone" 
          dataKey="cancelled" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--destructive))' }}
          name="Cancelled"
        />
      </LazyLineChart>
    </LazyResponsiveContainer>
  )
})

