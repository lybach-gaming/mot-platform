"use client"

import { Copy, ExternalLink } from 'lucide-react'
import { useState } from "react"

interface ConversionData {
  id: string
  txHash: string
  chain: string
  time: string
  buyerWallet: string
  type: "initial" | "reload"
  fmvMot: number
  fmvUsd: number
  commissionRule: string
  commission: number
  status: "completed" | "pending" | "reversed"
}

const sampleConversions: ConversionData[] = [
  {
    id: "conv_001",
    txHash: "5Jxq...8pQ3",
    chain: "Solana",
    time: "2024-01-15 14:32:00 UTC",
    buyerWallet: "DRpP...7Kj9",
    type: "initial",
    fmvMot: 500,
    fmvUsd: 2500,
    commissionRule: "Tier 1: 5%",
    commission: 125,
    status: "completed",
  },
  {
    id: "conv_002",
    txHash: "3Kmx...9pL2",
    chain: "Solana",
    time: "2024-01-15 10:15:00 UTC",
    buyerWallet: "9HxK...2mQ5",
    type: "reload",
    fmvMot: 250,
    fmvUsd: 1250,
    commissionRule: "Tier 2: 3%",
    commission: 37.5,
    status: "completed",
  },
]

export default function ConversionDrillDown() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Conversions</h3>

      <div className="space-y-3">
        {sampleConversions.map((conv) => (
          <div key={conv.id} className="border border-border rounded-lg overflow-hidden">
            {/* Summary Row */}
            <button
              onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
              className="w-full p-4 hover:bg-muted transition-colors text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      conv.type === "initial" ? "bg-accent/20 text-accent" : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {conv.type.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium text-foreground">{conv.time}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">FMV (MOT/USD)</p>
                  <p className="text-sm font-medium text-foreground">
                    {conv.fmvMot} MOT / ${conv.fmvUsd}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission Rule</p>
                  <p className="text-sm font-medium text-foreground">{conv.commissionRule}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="text-sm font-bold text-accent">${conv.commission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      conv.status === "completed"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === conv.id && (
              <div className="bg-muted/30 p-4 border-t border-border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground">{conv.txHash}</code>
                      <Copy size={16} className="cursor-pointer hover:text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Chain</p>
                    <p className="text-sm font-medium text-foreground">{conv.chain}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Buyer Wallet (Hashed)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-foreground">{conv.buyerWallet}</code>
                      <Copy size={16} className="cursor-pointer hover:text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Explorer Link</p>
                    <a href="#" className="text-sm text-accent hover:underline flex items-center gap-1">
                      View on Solana Explorer <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
