"use client"

import { Lock, Shield, Key, Copy, Check } from 'lucide-react'
import { useState } from "react"

export default function WalletPanel() {
  const [copied, setCopied] = useState(false)

  const walletAddress = "EJwyCDwXYoUgCQcsFuYAQRjSGukxFV2ne7DqJMoWFVJ3"

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Wallet & Security</h3>

      <div className="space-y-4">
        {/* Connected Address - Solana */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Connected Solana Address</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-foreground break-all">{walletAddress}</code>
            <button onClick={handleCopyAddress} className="p-2 hover:bg-muted rounded transition-colors flex-shrink-0 ml-2">
              {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* KYC Status */}
        <div className="p-4 border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-accent" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground">KYC Status</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">Verified</span>
        </div>

        {/* OFAC Status */}
        <div className="p-4 border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-green-500" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground">OFAC Screening</p>
              <p className="text-xs text-muted-foreground">Clear</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-semibold rounded-full">Passed</span>
        </div>

        {/* 2FA Status */}
        <div className="p-4 border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="text-accent" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Enabled</p>
            </div>
          </div>
          <button className="px-3 py-1 text-xs font-medium border border-border rounded hover:bg-muted transition-colors">
            Manage
          </button>
        </div>

        {/* Payout Allowlist - Solana */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Lock className="text-accent" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Payout Allowlist</p>
                <p className="text-xs text-muted-foreground">Approved Solana destinations</p>
              </div>
            </div>
            <button className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors">
              Add
            </button>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <code className="text-foreground text-xs font-mono break-all">EJwyCD...oWFVJ3</code>
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
