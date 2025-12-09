"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown } from "lucide-react"

interface Transaction {
  id: string
  type: "earning" | "payout" | "fee" | "bonus"
  description: string
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "earning",
    description: "Referral earnings - Campaign A",
    amount: 450,
    status: "completed",
    date: "2024-03-20",
  },
  {
    id: "2",
    type: "payout",
    description: "Bank transfer withdrawal",
    amount: -5000,
    status: "completed",
    date: "2024-03-18",
  },
  {
    id: "3",
    type: "earning",
    description: "Referral earnings - Campaign B",
    amount: 320,
    status: "completed",
    date: "2024-03-17",
  },
  {
    id: "4",
    type: "fee",
    description: "Monthly platform fee",
    amount: -25,
    status: "completed",
    date: "2024-03-15",
  },
  {
    id: "5",
    type: "bonus",
    description: "Performance bonus - March",
    amount: 200,
    status: "completed",
    date: "2024-03-14",
  },
  {
    id: "6",
    type: "payout",
    description: "Crypto withdrawal (ETH)",
    amount: -2000,
    status: "pending",
    date: "2024-03-21",
  },
]

export default function TransactionHistory() {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "earning":
        return { icon: ArrowDown, label: "Earning", color: "text-green-600" }
      case "payout":
        return { icon: ArrowUp, label: "Payout", color: "text-blue-600" }
      case "fee":
        return { icon: ArrowUp, label: "Fee", color: "text-red-600" }
      case "bonus":
        return { icon: ArrowDown, label: "Bonus", color: "text-purple-600" }
      default:
        return { icon: ArrowDown, label: "Transaction", color: "text-gray-600" }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
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
      <h3 className="text-lg font-semibold text-foreground mb-4">Transaction History</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const typeInfo = getTypeInfo(transaction.type)
              const Icon = typeInfo.icon
              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                      <span className="text-sm font-medium">{typeInfo.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{transaction.description}</TableCell>
                  <TableCell className="font-semibold">
                    <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                      {transaction.amount > 0 ? "+" : ""} ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${getStatusColor(transaction.status)}`}>{transaction.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{transaction.date}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
