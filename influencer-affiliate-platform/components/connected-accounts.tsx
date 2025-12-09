"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ban as Bank, WalletIcon, Trash2, Plus } from 'lucide-react'

interface Account {
  id: string
  type: "bank" | "crypto" | "paypal"
  name: string
  address: string
  status: "verified" | "pending" | "failed"
  primary: boolean
}

const accounts: Account[] = [
  {
    id: "1",
    type: "bank",
    name: "Chase Bank",
    address: "••••••1234",
    status: "verified",
    primary: true,
  },
  {
    id: "2",
    type: "crypto",
    name: "Solana Wallet",
    address: "EJwyCD2E1g6iB6tt5zA9n2zV38GQpfKSm57MCnXiWXKX",
    status: "verified",
    primary: false,
  },
  {
    id: "3",
    type: "paypal",
    name: "PayPal Account",
    address: "john@example.com",
    status: "pending",
    primary: false,
  },
]

export default function ConnectedAccounts() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Bank className="w-5 h-5" />
      case "crypto":
        return <WalletIcon className="w-5 h-5" />
      case "paypal":
        return <WalletIcon className="w-5 h-5" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Connected Accounts</h3>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">{getTypeIcon(account.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{account.name}</p>
                  {account.primary && <Badge className="bg-accent text-accent-foreground text-xs">Primary</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{account.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`capitalize ${getStatusColor(account.status)}`}>{account.status}</Badge>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <p>
          <strong>Tip:</strong> Set a primary account for faster payouts. Your funds will be automatically transferred
          to this account.
        </p>
      </div>
    </Card>
  )
}
