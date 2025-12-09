"use client"
import KPICard from "@/components/kpi-card"
import DailyChart from "@/components/daily-chart"
import PayoutHistory from "@/components/payout-history"
import ActiveCampaigns from "@/components/active-campaigns"
import { TrendingUp, Clock as Click, Target, Zap } from "lucide-react"
import { useI18n } from "@/components/i18n-context"

export default function DashboardContent() {
  const { t } = useI18n()

  const kpis = [
    {
      title: t("totalEarnings"),
      value: "$58,145.07",
      change: "+2.5%",
      icon: TrendingUp,
      isHighlight: true,
    },
    {
      title: t("epc"),
      value: "$3.21",
      change: "+1.2%",
      icon: Zap,
    },
    {
      title: t("initialVsReload"),
      value: "68% / 32%",
      change: "Based on conversions",
      icon: Target,
    },
    {
      title: t("clicks"),
      value: "4,275",
      change: "+2.5%",
      icon: Click,
    },
    {
      title: t("conversions"),
      value: "385",
      change: "+8%",
      icon: Target,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
            {t("viewReports")}
          </button>
          <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-bold">
            {t("requestPayout")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts and data sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily chart */}
        <div className="lg:col-span-2">
          <DailyChart />
        </div>

        {/* Payout history */}
        <div>
          <PayoutHistory />
        </div>
      </div>

      {/* Active campaigns */}
      <ActiveCampaigns />
    </div>
  )
}
