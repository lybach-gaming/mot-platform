"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Medal } from "lucide-react"

const leaderboardData = [
  { rank: 1, name: "Alex Johnson", referrals: 1245, conversions: 156, earnings: "$4,680", status: "Active" },
  { rank: 2, name: "Sarah Williams", referrals: 1089, conversions: 142, earnings: "$4,260", status: "Active" },
  { rank: 3, name: "Michael Chen", referrals: 956, conversions: 125, earnings: "$3,750", status: "Active" },
  { rank: 4, name: "Emily Rodriguez", referrals: 834, conversions: 108, earnings: "$3,240", status: "Active" },
  { rank: 5, name: "James Brown", referrals: 723, conversions: 92, earnings: "$2,760", status: "Active" },
  { rank: 6, name: "Lisa Taylor", referrals: 645, conversions: 81, earnings: "$2,430", status: "Inactive" },
  { rank: 7, name: "David Martinez", referrals: 567, conversions: 71, earnings: "$2,130", status: "Active" },
  { rank: 8, name: "Jessica Lee", referrals: 489, conversions: 62, earnings: "$1,860", status: "Active" },
]

const yourStats = {
  rank: 12,
  referrals: 342,
  conversions: 45,
  earnings: "$1,350",
  percentile: 78,
}

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Affiliate Leaderboard</h1>
            <p className="text-foreground/60 mt-2">See how you rank among top affiliates</p>
          </div>
        </div>

        {/* Your Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-2 border-accent">
            <p className="text-foreground/60 text-sm font-medium">Your Rank</p>
            <p className="text-3xl font-bold text-accent mt-2"># {yourStats.rank}</p>
            <p className="text-foreground/50 text-xs mt-2">Top {yourStats.percentile}% of affiliates</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Your Referrals</p>
            <p className="text-3xl font-bold text-foreground mt-2">{yourStats.referrals}</p>
            <p className="text-foreground/50 text-xs mt-2">+5 this week</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Your Conversions</p>
            <p className="text-3xl font-bold text-foreground mt-2">{yourStats.conversions}</p>
            <p className="text-foreground/50 text-xs mt-2">13.2% conversion rate</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Your Earnings</p>
            <p className="text-3xl font-bold text-accent mt-2">{yourStats.earnings}</p>
            <p className="text-foreground/50 text-xs mt-2">+$230 this month</p>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Top Affiliates</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90">
                This Month
              </button>
              <button className="px-4 py-2 rounded-md bg-background text-foreground text-sm font-medium hover:bg-background/80 border border-border">
                All Time
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Rank</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Affiliate</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Referrals</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Conversions</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Earnings</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((affiliate) => (
                  <tr key={affiliate.rank} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {affiliate.rank <= 3 && (
                          <Medal
                            size={18}
                            className={
                              affiliate.rank === 1
                                ? "text-yellow-500"
                                : affiliate.rank === 2
                                  ? "text-gray-400"
                                  : "text-orange-600"
                            }
                          />
                        )}
                        <span className="font-bold text-foreground"># {affiliate.rank}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">{affiliate.name}</td>
                    <td className="py-3 px-4 text-foreground">{affiliate.referrals}</td>
                    <td className="py-3 px-4 text-foreground">{affiliate.conversions}</td>
                    <td className="py-3 px-4 text-accent font-semibold">{affiliate.earnings}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          affiliate.status === "Active"
                            ? "bg-green-500/20 text-green-600"
                            : "bg-gray-500/20 text-gray-600"
                        }`}
                      >
                        {affiliate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rewards Section */}
        <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <h3 className="text-lg font-bold text-foreground mb-4">🎉 Exclusive Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground">Top 10 Bonus</p>
              <p className="text-foreground/60 text-sm mt-1">Extra $100 commission for top 10 affiliates</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground">Monthly Prize</p>
              <p className="text-foreground/60 text-sm mt-1">#1 affiliate wins $500 Amazon gift card</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground">VIP Access</p>
              <p className="text-foreground/60 text-sm mt-1">Top 5 get early access to new products</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
