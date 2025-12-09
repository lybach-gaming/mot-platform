"use client"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import AnalyticsMetrics from "@/components/analytics-metrics"
import EarningsChart from "@/components/earnings-chart"
import ConversionFunnel from "@/components/conversion-funnel"
import TopCampaigns from "@/components/top-campaigns"
import GeographicPerformance from "@/components/geographic-performance"
import AnalyticsFilters from "@/components/analytics-filters"

export default function EarningsPage() {
  const [period, setPeriod] = useState("30d")

  const handleExport = (format: string) => {
    console.log(`Exporting earnings report as ${format}`)
    // Implement export logic here
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Earnings Analytics</h1>
            <p className="text-muted-foreground mt-1">Detailed performance metrics and reports</p>
          </div>
          <AnalyticsFilters onDateChange={setPeriod} onExport={handleExport} />
        </div>

        {/* Key Metrics */}
        <AnalyticsMetrics />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EarningsChart />
          </div>
          <ConversionFunnel />
        </div>

        {/* Top Campaigns */}
        <TopCampaigns />

        {/* Geographic Performance */}
        <GeographicPerformance />
      </div>
    </DashboardLayout>
  )
}
