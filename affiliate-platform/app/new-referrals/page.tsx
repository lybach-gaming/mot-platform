"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Share2, Link2 } from "lucide-react"

export default function NewReferralsPage() {
  const [referralLinks, setReferralLinks] = useState([
    {
      id: 1,
      name: "Product A Campaign",
      link: "https://aff.example.com/ref123",
      clicks: 245,
      conversions: 12,
      commission: "$240",
    },
    {
      id: 2,
      name: "General Referral",
      link: "https://aff.example.com/ref456",
      clicks: 180,
      conversions: 8,
      commission: "$160",
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [linkName, setLinkName] = useState("")

  const handleCreateLink = () => {
    if (linkName.trim()) {
      const newLink = {
        id: referralLinks.length + 1,
        name: linkName,
        link: `https://aff.example.com/ref${Math.random().toString(36).substr(2, 9)}`,
        clicks: 0,
        conversions: 0,
        commission: "$0",
      }
      setReferralLinks([...referralLinks, newLink])
      setLinkName("")
      setShowCreateModal(false)
    }
  }

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referral Link Generator</h1>
            <p className="text-foreground/60 mt-2">Create and manage your referral links</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90">
            <Link2 size={16} className="mr-2" />
            New Referral Link
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Total Links</p>
            <p className="text-3xl font-bold text-foreground mt-2">{referralLinks.length}</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Total Clicks</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {referralLinks.reduce((sum, l) => sum + l.clicks, 0)}
            </p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Total Conversions</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {referralLinks.reduce((sum, l) => sum + l.conversions, 0)}
            </p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-foreground/60 text-sm font-medium">Total Commission</p>
            <p className="text-3xl font-bold text-accent mt-2">
              ${referralLinks.reduce((sum, l) => sum + Number.parseInt(l.commission.replace("$", "")), 0)}
            </p>
          </Card>
        </div>

        {/* Referral Links Table */}
        <Card className="bg-card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Referral Links</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Link</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Clicks</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Conversions</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Commission</th>
                  <th className="text-left py-3 px-4 text-foreground/70 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {referralLinks.map((ref) => (
                  <tr key={ref.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{ref.name}</td>
                    <td className="py-3 px-4 text-foreground/70 text-sm truncate max-w-xs">{ref.link}</td>
                    <td className="py-3 px-4 text-foreground">{ref.clicks}</td>
                    <td className="py-3 px-4 text-foreground">{ref.conversions}</td>
                    <td className="py-3 px-4 text-accent font-semibold">{ref.commission}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(ref.link)}
                          className="p-2 rounded-md hover:bg-background/50 transition-colors"
                          title="Copy link"
                        >
                          <Copy size={16} className="text-foreground/60" />
                        </button>
                        <button className="p-2 rounded-md hover:bg-background/50 transition-colors" title="Share">
                          <Share2 size={16} className="text-foreground/60" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Link Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-foreground mb-4">Create New Referral Link</h3>
              <input
                type="text"
                placeholder="Link name (e.g., Product A Campaign)"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateLink} className="flex-1 bg-accent hover:bg-accent/90">
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-background hover:bg-background/80 border border-border text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
