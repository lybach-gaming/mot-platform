"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { hour: "01:00", value: 0 },
  { hour: "02:00", value: 200 },
  { hour: "03:00", value: 150 },
  { hour: "04:00", value: 100 },
  { hour: "05:00", value: 14056 },
  { hour: "06:00", value: 50 },
  { hour: "07:00", value: 75 },
  { hour: "08:00", value: 100 },
  { hour: "09:00", value: 120 },
  { hour: "10:00", value: 90 },
  { hour: "11:00", value: 60 },
  { hour: "12:00", value: 45 },
]

export default function DailyChart() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Daily Clicks and Conversions</h3>
          <p className="text-3xl font-bold text-foreground mt-2">4,275</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm font-medium rounded bg-muted text-foreground hover:bg-muted/80">
            Clicks
          </button>
          <button className="px-3 py-1 text-sm font-medium rounded bg-muted/50 text-muted-foreground hover:bg-muted/70">
            Conversions
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Today, 05:00</span>
        <span>Clicks: 14,056</span>
      </div>
    </div>
  )
}
