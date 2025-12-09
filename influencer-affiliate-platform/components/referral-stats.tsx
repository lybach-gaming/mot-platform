"use client"
import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Link2, Target } from "lucide-react"

export default function ReferralStats() {
  const stats = [
    {
      label: "Active Referrals",
      value: "1,234",
      change: "+12%",
      icon: Users,
    },
    {
      label: "Pending Referrals",
      value: "89",
      change: "+5%",
      icon: Target,
    },
    {
      label: "Referral Links Created",
      value: "42",
      change: "+3%",
      icon: Link2,
    },
    {
      label: "Referral Revenue",
      value: "$12,450",
      change: "+18%",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-xs text-green-600">{stat.change} from last month</p>
          </Card>
        )
      })}
    </div>
  )
}
