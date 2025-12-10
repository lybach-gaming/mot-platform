"use client"
import DashboardLayout from "@/components/dashboard-layout"
import ReferralStats from "@/components/referral-stats"
import ReferralList from "@/components/referral-list"
import ReferralPerformanceChart from "@/components/referral-performance-chart"
import CreateReferralModal from "@/components/create-referral-modal"

export default function ReferralsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referral Tracking</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage your referral links</p>
          </div>
          <CreateReferralModal />
        </div>

        {/* Statistics */}
        <ReferralStats />

        {/* Performance Chart */}
        <ReferralPerformanceChart />

        {/* Referral Links Table */}
        <ReferralList />
      </div>
    </DashboardLayout>
  )
}
