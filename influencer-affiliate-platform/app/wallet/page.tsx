"use client"
import DashboardLayout from "@/components/dashboard-layout"
import WalletBalance from "@/components/wallet-balance"
import TransactionHistory from "@/components/transaction-history"
import ConnectedAccounts from "@/components/connected-accounts"

export default function WalletPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wallet & Payouts</h1>
          <p className="text-muted-foreground mt-1">Manage your earnings and withdraw funds</p>
        </div>

        {/* Wallet Balance */}
        <WalletBalance />

        {/* Transaction History */}
        <TransactionHistory />

        {/* Connected Accounts */}
        <ConnectedAccounts />
      </div>
    </DashboardLayout>
  )
}
