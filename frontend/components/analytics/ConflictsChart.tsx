'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface ConflictsChartData {
  period: string
  total: number
  resolved: number
  pending: number
}

interface ConflictsChartProps {
  data: ConflictsChartData[]
}

/**
 * Weather Conflicts Chart
 * 
 * Displays weather conflict statistics over time periods
 * Shows resolved vs pending conflicts for easy tracking
 * Refactored to use theme-aware colors from CSS variables
 */
export function ConflictsChart({ data }: ConflictsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No conflict data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="period" 
          className="text-xs fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '8px',
            color: 'hsl(var(--card-foreground))'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}
        />
        <Bar 
          dataKey="resolved" 
          fill="hsl(var(--chart-1))" 
          radius={[4, 4, 0, 0]}
          name="Resolved"
        />
        <Bar 
          dataKey="pending" 
          fill="hsl(var(--chart-2))" 
          radius={[4, 4, 0, 0]}
          name="Pending"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

