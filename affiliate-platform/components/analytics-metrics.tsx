"use client"
import { Card } from "@/components/ui/card"
import type React from "react"

import { ArrowUp, ArrowDown, BarChart3, TrendingUp } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  change: number
  trend: "up" | "down"
  icon: React.ReactNode
}

function MetricCard({ label, value, change, trend, icon }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-accent">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-3">{value}</p>
      <div className="flex items-center gap-1">
        {trend === "up" ? (
          <ArrowUp className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-600" />
        )}
        <span className={trend === "up" ? "text-green-600" : "text-red-600"}>{Math.abs(change)}%</span>
        <span className="text-xs text-muted-foreground ml-1">vs last period</span>
      </div>
    </Card>
  )
}

export default function AnalyticsMetrics() {
  const metrics = [
    {
      label: "Total Revenue",
      value: "$58,145",
      change: 12.5,
      trend: "up" as const,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Avg. Commission Rate",
      value: "8.2%",
      change: 2.1,
      trend: "up" as const,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Conversion Rate",
      value: "9.0%",
      change: 8,
      trend: "up" as const,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Avg. Order Value",
      change: -3.2,
      value: "$145.20",
      trend: "down" as const,
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          change={metric.change}
          trend={metric.trend}
          icon={metric.icon}
        />
      ))}
    </div>
  )
}
