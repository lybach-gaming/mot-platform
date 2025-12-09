"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const commissionData = [
  { date: "Aug 1", commission: 450, conversions: 12, pending: 100 },
  { date: "Aug 2", commission: 520, conversions: 15, pending: 120 },
  { date: "Aug 3", commission: 380, conversions: 10, pending: 85 },
  { date: "Aug 4", commission: 640, conversions: 18, pending: 150 },
  { date: "Aug 5", commission: 710, conversions: 20, pending: 170 },
  { date: "Aug 6", commission: 580, conversions: 16, pending: 130 },
  { date: "Aug 7", commission: 820, conversions: 23, pending: 200 },
]

const commissionBreakdown = [
  { category: "Product A", earned: 2400, pending: 400, completed: 2000 },
  { category: "Product B", earned: 1800, pending: 300, completed: 1500 },
  { category: "Product C", earned: 1200, pending: 200, completed: 1000 },
  { category: "Service D", earned: 1600, pending: 250, completed: 1350 },
]

export default function CommissionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Commission Earnings</h1>
            <p className="text-foreground/60 mt-2">Track your commission earnings by product and date</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Total Earned</p>
            <p className="text-3xl font-bold text-accent mt-2">$8,950</p>
            <p className="text-foreground/50 text-xs mt-2">+12% from last month</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Pending Payout</p>
            <p className="text-3xl font-bold text-foreground mt-2">$1,550</p>
            <p className="text-foreground/50 text-xs mt-2">Approx. 5-7 days</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Completed Payouts</p>
            <p className="text-3xl font-bold text-foreground mt-2">$7,400</p>
            <p className="text-foreground/50 text-xs mt-2">Already in your wallet</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Avg. Commission</p>
            <p className="text-3xl font-bold text-foreground mt-2">$47.50</p>
            <p className="text-foreground/50 text-xs mt-2">Per conversion</p>
          </Card>
        </div>

        {/* Commission Chart */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6">Commission Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-foreground-60)" />
              <YAxis stroke="var(--color-foreground-60)" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="commission" stroke="var(--color-accent)" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="var(--color-foreground-60)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Commission Breakdown by Product */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6">Commission Breakdown by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commissionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="category" stroke="var(--color-foreground-60)" />
              <YAxis stroke="var(--color-foreground-60)" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="var(--color-accent)" />
              <Bar dataKey="pending" stackId="a" fill="var(--color-foreground-60)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Commission History Table */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Commissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Product</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Conversions</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Rate</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4 text-foreground font-medium">Product A</td>
                  <td className="py-3 px-4 text-foreground">15</td>
                  <td className="py-3 px-4 text-foreground">$30/conv</td>
                  <td className="py-3 px-4 text-accent font-semibold">$450</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground/60">Aug 7, 2024</td>
                </tr>
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4 text-foreground font-medium">Product B</td>
                  <td className="py-3 px-4 text-foreground">10</td>
                  <td className="py-3 px-4">$35/conv</td>
                  <td className="py-3 px-4 text-accent font-semibold">$350</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-medium">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground/60">Aug 6, 2024</td>
                </tr>
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4 text-foreground font-medium">Product C</td>
                  <td className="py-3 px-4 text-foreground">12</td>
                  <td className="py-3 px-4">$25/conv</td>
                  <td className="py-3 px-4 text-accent font-semibold">$300</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground/60">Aug 5, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
