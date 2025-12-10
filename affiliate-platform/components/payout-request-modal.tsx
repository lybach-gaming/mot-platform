"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface PayoutRequestModalProps {
  trigger?: React.ReactNode
}

export default function PayoutRequestModal({ trigger }: PayoutRequestModalProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank")
  const [error, setError] = useState("")

  const handleRequest = () => {
    if (!amount) {
      setError("Please enter an amount")
      return
    }
    if (Number.parseFloat(amount) < 100) {
      setError("Minimum payout amount is $100")
      return
    }
    if (Number.parseFloat(amount) > 45230.5) {
      setError("Amount exceeds available balance")
      return
    }

    console.log("Payout request:", { amount, method })
    setOpen(false)
    setAmount("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Request Payout</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>Withdraw your available earnings to your connected account</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Available balance: <strong>$45,230.50</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payout Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              min="100"
              max="45230.50"
            />
            <p className="text-xs text-muted-foreground">Minimum: $100 | Maximum: $45,230.50</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payout Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Payout Amount</span>
              <span className="font-semibold">${amount || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Processing Fee (2%)</span>
              <span className="font-semibold">${amount ? (Number.parseFloat(amount) * 0.02).toFixed(2) : "0.00"}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span className="text-foreground font-semibold">You&apos;ll receive</span>
              <span className="font-bold text-accent">
                ${amount ? (Number.parseFloat(amount) * 0.98).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleRequest}>
              Request Payout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
