"use client"
import DashboardLayout from "@/components/dashboard-layout"
import QuickLinkGenerator from "@/components/quick-link-generator"
import AffiliateLeaderboard from "@/components/affiliate-leaderboard"

export default function LinksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Link Generator & Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Generate custom links and track top performers</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickLinkGenerator />
          <div className="lg:col-span-2">
            <AffiliateLeaderboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
