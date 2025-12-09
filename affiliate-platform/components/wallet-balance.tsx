"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Eye, EyeOff, Send } from "lucide-react"
import { useState } from "react"

export default function WalletBalance() {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Balance */}
      <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-foreground">{showBalance ? "$58,145.07" : "••••••"}</h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <Wallet className="w-12 h-12 text-accent opacity-50" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="font-semibold text-foreground">$45,230.50</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="font-semibold text-foreground">$12,914.57</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">On Hold</p>
            <p className="font-semibold text-foreground">$0</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Add Funds
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">This Month</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Earned</p>
            <p className="text-xl font-bold text-accent">$8,450.25</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Withdrawn</p>
            <p className="text-xl font-bold text-foreground">$5,000</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fees</p>
            <p className="text-lg font-bold text-destructive">-$42.50</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
