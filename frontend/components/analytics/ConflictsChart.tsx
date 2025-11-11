'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export interface ConflictsChartData {
  period: string
  total: number
  resolved: number
  pending: number
}

interface ConflictsChartProps {
  data: ConflictsChartData[]
}

// Lazy load Recharts components for better performance
const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    loading: () => <Skeleton className="w-full h-[300px]" />,
    ssr: false,
  }
)

const LazyBar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
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
 * Weather Conflicts Chart
 * 
 * Displays weather conflict statistics over time periods
 * Shows resolved vs pending conflicts for easy tracking
 * Uses Recharts with lazy loading for optimal performance
 * Refactored to use theme-aware colors from CSS variables
 * Memoized to prevent unnecessary re-renders
 */
export const ConflictsChart = memo(function ConflictsChart({ data }: ConflictsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No conflict data available</p>
      </div>
    )
  }

  return (
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyBarChart data={data}>
        <LazyCartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <LazyXAxis 
          dataKey="period" 
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
          {...({ wrapperStyle: { fontSize: '12px', color: 'hsl(var(--foreground))' } } as any)}
        />
        <LazyBar 
          dataKey="resolved" 
          fill="hsl(var(--chart-1))" 
          radius={[4, 4, 0, 0]}
          name="Resolved"
        />
        <LazyBar 
          dataKey="pending" 
          fill="hsl(var(--chart-2))" 
          radius={[4, 4, 0, 0]}
          name="Pending"
        />
      </LazyBarChart>
    </LazyResponsiveContainer>
  )
})

