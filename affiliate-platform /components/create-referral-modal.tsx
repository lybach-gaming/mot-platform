"use client"
import { useState } from "react"
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
import { Plus } from "lucide-react"

export default function CreateReferralModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [campaign, setCampaign] = useState("")

  const handleCreate = () => {
    console.log("Creating referral link:", { name, campaign })
    setOpen(false)
    setName("")
    setCampaign("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Referral Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Referral Link</DialogTitle>
          <DialogDescription>Generate a custom referral link to track and manage your referrals</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-name">Link Name</Label>
            <Input
              id="link-name"
              placeholder="e.g., Twitter Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign Type</Label>
            <select
              id="campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">Select a campaign type</option>
              <option value="twitter">Twitter/X</option>
              <option value="discord">Discord</option>
              <option value="telegram">Telegram</option>
              <option value="email">Email</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleCreate}
              disabled={!name || !campaign}
            >
              Create Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
