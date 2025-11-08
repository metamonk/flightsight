'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface BookingsChartData {
  date: string
  confirmed: number
  weatherHold: number
  cancelled: number
}

interface BookingsChartProps {
  data: BookingsChartData[]
}

/**
 * Bookings Trend Chart
 * 
 * Visualizes booking trends over time, showing different statuses
 * Uses Recharts for lightweight, responsive visualization
 * Refactored to use theme-aware colors from CSS variables
 */
export function BookingsChart({ data }: BookingsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No booking data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="date" 
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
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="confirmed" 
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--chart-1))' }}
          name="Confirmed"
        />
        <Line 
          type="monotone" 
          dataKey="weatherHold" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--chart-2))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
          name="Weather Hold"
        />
        <Line 
          type="monotone" 
          dataKey="cancelled" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--destructive))' }}
          name="Cancelled"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

