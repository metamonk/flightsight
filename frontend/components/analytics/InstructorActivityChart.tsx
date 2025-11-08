'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export interface InstructorActivityData {
  name: string
  value: number
  [key: string]: string | number
}

interface InstructorActivityChartProps {
  data: InstructorActivityData[]
}

// Using theme chart colors for consistency
const CHART_COLORS = [
  'hsl(var(--chart-1))', // primary green
  'hsl(var(--chart-2))', // secondary teal
  'hsl(var(--chart-3))', // tertiary
  'hsl(var(--chart-4))', // quaternary
  'hsl(var(--chart-5))', // quinary
  'hsl(var(--primary))', // primary
  'hsl(var(--accent))',  // accent
  'hsl(var(--secondary))', // secondary
]

/**
 * Instructor Activity Pie Chart
 * 
 * Visualizes booking distribution across instructors
 * Helps identify workload balance
 * Refactored to use theme-aware colors from CSS variables
 */
export function InstructorActivityChart({ data }: InstructorActivityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No instructor activity data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="hsl(var(--chart-1))"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
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
          layout="horizontal"
          verticalAlign="bottom"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

