"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Copy, Trash2, Download, Plus } from "lucide-react"

interface AffiliateLink {
  id: string
  vanityName: string
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  sub5: string
  fullUrl: string
  clicks: number
  conversions: number
  createdAt: string
}

const SAMPLE_LINKS: AffiliateLink[] = [
  {
    id: "link_001",
    vanityName: "summer-campaign",
    sub1: "email",
    sub2: "newsletter",
    sub3: "promo",
    sub4: "",
    sub5: "",
    fullUrl: "https://mot.affiliate/ref/john-doe/summer-campaign?sub1=email&sub2=newsletter&sub3=promo",
    clicks: 1250,
    conversions: 45,
    createdAt: "2024-01-10",
  },
  {
    id: "link_002",
    vanityName: "twitter-viral",
    sub1: "social",
    sub2: "twitter",
    sub3: "viral",
    sub4: "q1",
    sub5: "",
    fullUrl: "https://mot.affiliate/ref/john-doe/twitter-viral?sub1=social&sub2=twitter&sub3=viral&sub4=q1",
    clicks: 3420,
    conversions: 128,
    createdAt: "2024-01-08",
  },
]

export default function LinkBuilderPage() {
  const [links, setLinks] = useState<AffiliateLink[]>(SAMPLE_LINKS)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vanityName: "",
    sub1: "",
    sub2: "",
    sub3: "",
    sub4: "",
    sub5: "",
  })
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopyUrl = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url)
    setCopied(linkId)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCreateLink = () => {
    const newLink: AffiliateLink = {
      id: `link_${Date.now()}`,
      ...formData,
      fullUrl: `https://mot.affiliate/ref/john-doe/${formData.vanityName}${getQueryString(formData)}`,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setLinks([newLink, ...links])
    setFormData({ vanityName: "", sub1: "", sub2: "", sub3: "", sub4: "", sub5: "" })
    setShowForm(false)
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  const handleExportCSV = () => {
    const headers = [
      "Vanity Name",
      "Sub1",
      "Sub2",
      "Sub3",
      "Sub4",
      "Sub5",
      "Full URL",
      "Clicks",
      "Conversions",
      "Created",
    ]
    const rows = links.map((link) => [
      link.vanityName,
      link.sub1,
      link.sub2,
      link.sub3,
      link.sub4,
      link.sub5,
      link.fullUrl,
      link.clicks,
      link.conversions,
      link.createdAt,
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mot-affiliate-links-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Link Builder</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Create Link
            </button>
          </div>
        </div>

        {/* Create Link Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Create New Link</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Vanity Name</label>
                <input
                  type="text"
                  placeholder="e.g., summer-campaign"
                  value={formData.vanityName}
                  onChange={(e) => setFormData({ ...formData, vanityName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">URL-friendly name for your campaign</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">SubIDs (optional - up to 5)</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {["sub1", "sub2", "sub3", "sub4", "sub5"].map((sub) => (
                  <div key={sub}>
                    <input
                      type="text"
                      placeholder={`${sub}`}
                      value={formData[sub as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [sub]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-accent text-sm"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Track campaigns across multiple dimensions</p>
            </div>

            {/* Preview */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Preview URL:</p>
              <code className="text-xs font-mono text-foreground break-all">
                https://mot.affiliate/ref/john-doe/{formData.vanityName}
                {getQueryString(formData)}
              </code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateLink}
                disabled={!formData.vanityName}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Create Link
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Links Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Vanity Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">SubIDs</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Conversions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">CVR</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{link.vanityName}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {[link.sub1, link.sub2, link.sub3, link.sub4, link.sub5].filter(Boolean).map((s, i) => (
                        <span key={i} className="inline-block mr-2 px-2 py-1 bg-muted rounded">
                          {s}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{link.clicks}</td>
                    <td className="px-6 py-4 font-medium text-accent">{link.conversions}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : "0"}%
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{link.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCopyUrl(link.fullUrl, link.id)}
                        className="p-2 hover:bg-muted rounded transition-colors mr-2"
                      >
                        {copied === link.id ? (
                          <span className="text-xs text-accent font-bold">✓</span>
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function getQueryString(data: Record<string, string>): string {
  const params = Object.entries(data)
    .filter(([_, value]) => value && !value.includes("sub"))
    .map(([key, value]) => `${key}=${value}`)
    .concat(
      Object.entries(data)
        .filter(([key, value]) => key.startsWith("sub") && value)
        .map(([key, value]) => `${key}=${value}`),
    )
  return params.length ? `?${params.join("&")}` : ""
}
