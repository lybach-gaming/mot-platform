"use client"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", earnings: 4200, referrals: 45, conversions: 8 },
  { month: "Feb", earnings: 5600, referrals: 62, conversions: 12 },
  { month: "Mar", earnings: 6800, referrals: 78, conversions: 15 },
  { month: "Apr", earnings: 7200, referrals: 85, conversions: 18 },
  { month: "May", earnings: 8900, referrals: 102, conversions: 22 },
  { month: "Jun", earnings: 9400, referrals: 115, conversions: 26 },
]

export default function EarningsChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Earnings Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="earnings" fill="var(--chart-1)" name="Earnings ($)" />
          <Bar dataKey="conversions" fill="var(--chart-2)" name="Conversions" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
