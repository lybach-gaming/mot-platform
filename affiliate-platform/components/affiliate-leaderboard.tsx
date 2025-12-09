"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal } from "lucide-react"

interface AffiliateRank {
  rank: number
  name: string
  earnings: number
  referrals: number
  status: "top_performer" | "rising_star" | "active"
}

const leaderboard: AffiliateRank[] = [
  { rank: 1, name: "Alex Johnson", earnings: 125400, referrals: 1245, status: "top_performer" },
  { rank: 2, name: "Sarah Chen", earnings: 98600, referrals: 892, status: "top_performer" },
  { rank: 3, name: "Marcus Williams", earnings: 87300, referrals: 756, status: "rising_star" },
  { rank: 4, name: "Emma Davis", earnings: 72450, referrals: 634, status: "active" },
  { rank: 5, name: "James Miller", earnings: 65800, referrals: 589, status: "active" },
]

export default function AffiliateLeaderboard() {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "top_performer":
        return "bg-yellow-100 text-yellow-800"
      case "rising_star":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Affiliates</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((affiliate) => (
              <TableRow key={affiliate.rank}>
                <TableCell>
                  <div className="flex items-center justify-center">{getRankBadge(affiliate.rank)}</div>
                </TableCell>
                <TableCell className="font-semibold">{affiliate.name}</TableCell>
                <TableCell className="text-accent font-bold">${affiliate.earnings.toLocaleString()}</TableCell>
                <TableCell>{affiliate.referrals.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={`capitalize ${getStatusColor(affiliate.status)}`}>
                    {affiliate.status.replace("_", " ")}
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
