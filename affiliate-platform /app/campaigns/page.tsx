"use client"
import DashboardLayout from "@/components/dashboard-layout"
import AvailableOffers from "@/components/available-offers"
import PromotionalMaterials from "@/components/promotional-materials"

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Campaigns</h1>
          <p className="text-muted-foreground mt-1">Browse and manage affiliate campaigns and offers</p>
        </div>

        {/* Available Offers */}
        <AvailableOffers />

        {/* Promotional Materials */}
        <PromotionalMaterials />
      </div>
    </DashboardLayout>
  )
}
