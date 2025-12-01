"use client"
import { type LucideIcon, MoreHorizontal } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change: string
  icon?: LucideIcon
  isHighlight?: boolean
}

export default function KPICard({ title, value, change, icon: Icon, isHighlight }: KPICardProps) {
  const isPositive = change.startsWith("+")

  return (
    <div
      className={`rounded-lg p-4 transition-all ${
        isHighlight ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-sm font-medium ${isHighlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isHighlight ? "text-primary-foreground" : "text-foreground"}`}>
            {value}
          </p>
        </div>
        <button
          className={`p-1 rounded hover:bg-muted ${isHighlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className={`text-sm font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600"}`}>
        {change}
      </div>
    </div>
  )
}
