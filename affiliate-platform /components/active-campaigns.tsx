"use client"
import { Search, Settings } from "lucide-react"

const campaigns = [
  {
    name: "XYZ Product",
    avatar: "📱",
    clicks: 2150,
    sales: 175,
    commission: "$525",
    date: "10 Aug 2024, 10:12 AM",
  },
  {
    name: "ABC Service",
    avatar: "🎯",
    clicks: 1890,
    sales: 143,
    commission: "$430",
    date: "10 Aug 2024, 08:20 AM",
  },
  {
    name: "DEF Software",
    avatar: "💻",
    clicks: 3420,
    sales: 290,
    commission: "$870",
    date: "09 Aug 2024, 08:00 PM",
  },
]

export default function ActiveCampaigns() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Active Campaigns</h3>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Campaign..."
              className="bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-2 hover:bg-muted rounded-lg">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 text-muted-foreground font-medium">Campaign Name</th>
              <th className="text-left py-3 text-muted-foreground font-medium">Clicks</th>
              <th className="text-left py-3 text-muted-foreground font-medium">Sales</th>
              <th className="text-left py-3 text-muted-foreground font-medium">Commission</th>
              <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.map((campaign, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{campaign.avatar}</span>
                    <span className="font-semibold text-foreground">{campaign.name}</span>
                  </div>
                </td>
                <td className="py-4 text-foreground">{campaign.clicks.toLocaleString()}</td>
                <td className="py-4 text-foreground">{campaign.sales}</td>
                <td className="py-4 font-semibold text-foreground">{campaign.commission}</td>
                <td className="py-4 text-muted-foreground text-xs">{campaign.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
