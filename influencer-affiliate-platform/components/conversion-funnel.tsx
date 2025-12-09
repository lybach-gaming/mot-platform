"use client"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const funnelData = [
  { stage: "Impressions", count: 24500, rate: 100 },
  { stage: "Clicks", count: 8750, rate: 35.7 },
  { stage: "Sign-ups", count: 1820, rate: 20.8 },
  { stage: "Conversions", count: 385, rate: 21.2 },
]

export default function ConversionFunnel() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Conversion Funnel</h3>
      <div className="space-y-6">
        {funnelData.map((item, index) => (
          <div key={item.stage}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground">{item.stage}</p>
              <p className="text-sm text-muted-foreground">
                {item.count.toLocaleString()} ({item.rate.toFixed(1)}%)
              </p>
            </div>
            <Progress value={item.rate} className="h-2" />
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          <strong>Conversion Rate:</strong> 1.57% from impressions to conversions
        </p>
      </div>
    </Card>
  )
}
