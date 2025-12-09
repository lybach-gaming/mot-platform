"use client"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe } from "lucide-react"

interface GeoData {
  country: string
  flag: string
  clicks: number
  conversions: number
  revenue: number
}

const geoData: GeoData[] = [
  { country: "United States", flag: "🇺🇸", clicks: 12450, conversions: 245, revenue: 18500 },
  { country: "United Kingdom", flag: "🇬🇧", clicks: 8920, conversions: 156, revenue: 11800 },
  { country: "Canada", flag: "🇨🇦", clicks: 6230, conversions: 98, revenue: 7400 },
  { country: "Australia", flag: "🇦🇺", clicks: 4560, conversions: 72, revenue: 5300 },
  { country: "Germany", flag: "🇩🇪", clicks: 3890, conversions: 58, revenue: 4200 },
]

export default function GeographicPerformance() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Performance by Country</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Conv. Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geoData.map((geo) => {
              const convRate = ((geo.conversions / geo.clicks) * 100).toFixed(1)
              return (
                <TableRow key={geo.country}>
                  <TableCell className="font-medium">
                    <span className="mr-2">{geo.flag}</span>
                    {geo.country}
                  </TableCell>
                  <TableCell>{geo.clicks.toLocaleString()}</TableCell>
                  <TableCell>{geo.conversions}</TableCell>
                  <TableCell className="font-semibold text-accent">${geo.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-semibold">{convRate}%</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
