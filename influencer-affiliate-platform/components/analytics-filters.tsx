"use client"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AnalyticsFiltersProps {
  onDateChange?: (period: string) => void
  onExport?: (format: string) => void
}

export default function AnalyticsFilters({ onDateChange, onExport }: AnalyticsFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Time Period
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select Period</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDateChange?.("7d")}>Last 7 days</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateChange?.("30d")}>Last 30 days</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateChange?.("90d")}>Last 90 days</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateChange?.("1y")}>Last year</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateChange?.("all")}>All time</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onExport?.("csv")}>CSV</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport?.("pdf")}>PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport?.("xlsx")}>Excel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
