"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Campaign {
  name: string
  clicks: number
  conversions: number
  revenue: number
  roi: number
  status: "active" | "paused"
}

const campaigns: Campaign[] = [
  { name: "Twitter Campaign Q2", clicks: 3420, conversions: 156, revenue: 5850, roi: 285, status: "active" },
  { name: "Discord Community", clicks: 2890, conversions: 124, revenue: 4680, roi: 245, status: "active" },
  { name: "Email Newsletter", clicks: 2145, conversions: 98, revenue: 3920, roi: 198, status: "active" },
  { name: "Telegram Group", clicks: 1560, conversions: 45, revenue: 1800, roi: 156, status: "paused" },
  { name: "Influencer Partnership", clicks: 980, conversions: 34, revenue: 1360, roi: 128, status: "active" },
]

export default function TopCampaigns() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Campaigns</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.name}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                <TableCell>{campaign.conversions}</TableCell>
                <TableCell className="font-semibold text-accent">${campaign.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="text-green-600 font-semibold">{campaign.roi}%</span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      campaign.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
