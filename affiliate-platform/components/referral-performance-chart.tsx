"use client"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { date: "Mon", clicks: 120, conversions: 12, revenue: 450 },
  { date: "Tue", clicks: 145, conversions: 15, revenue: 580 },
  { date: "Wed", clicks: 98, conversions: 10, revenue: 380 },
  { date: "Thu", clicks: 167, conversions: 18, revenue: 680 },
  { date: "Fri", clicks: 189, conversions: 22, revenue: 820 },
  { date: "Sat", clicks: 156, conversions: 18, revenue: 720 },
  { date: "Sun", clicks: 134, conversions: 14, revenue: 580 },
]

export default function ReferralPerformanceChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Performance This Week</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ fill: "var(--chart-1)", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ fill: "var(--chart-2)", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={{ fill: "var(--chart-3)", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
