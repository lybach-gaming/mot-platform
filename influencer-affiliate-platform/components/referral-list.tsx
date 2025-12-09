"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Referral {
  id: string
  link: string
  code: string
  clicks: number
  conversions: number
  revenue: number
  status: "active" | "pending" | "inactive"
  created: string
}

const referrals: Referral[] = [
  {
    id: "1",
    link: "https://affiliate.hub/ref/john-2024-001",
    code: "JOHN2024001",
    clicks: 245,
    conversions: 12,
    revenue: 450,
    status: "active",
    created: "2024-01-15",
  },
  {
    id: "2",
    link: "https://affiliate.hub/ref/john-2024-002",
    code: "JOHN2024002",
    clicks: 189,
    conversions: 8,
    revenue: 320,
    status: "active",
    created: "2024-02-20",
  },
  {
    id: "3",
    link: "https://affiliate.hub/ref/john-2024-003",
    code: "JOHN2024003",
    clicks: 56,
    conversions: 2,
    revenue: 80,
    status: "pending",
    created: "2024-03-10",
  },
  {
    id: "4",
    link: "https://affiliate.hub/ref/john-2024-004",
    code: "JOHN2024004",
    clicks: 12,
    conversions: 0,
    revenue: 0,
    status: "inactive",
    created: "2024-03-25",
  },
]

export default function ReferralList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Referral Links</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referral Link</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell className="max-w-xs">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-1.5 rounded text-foreground truncate">{referral.code}</code>
                    <Button variant="ghost" size="sm" className="p-0 h-auto" title="Copy link">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{referral.clicks}</TableCell>
                <TableCell className="font-semibold">{referral.conversions}</TableCell>
                <TableCell className="font-semibold text-accent">${referral.revenue}</TableCell>
                <TableCell>
                  <Badge className={`capitalize ${getStatusColor(referral.status)}`}>{referral.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{referral.created}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
