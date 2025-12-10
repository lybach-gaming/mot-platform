"use client"

import { Copy, Zap, Share2, ImageIcon } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/components/i18n-context"

export default function QuickActionsBar() {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()

  const referralLink = "https://mot.affiliate/ref/john-doe-123"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const encodedLink = encodeURIComponent(referralLink)
    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
    }
    if (urls[platform]) {
      window.open(urls[platform], "_blank")
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <Copy size={18} />
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
        >
          <Zap size={18} />
          <span>Build Widget</span>
        </button>

        <button
          onClick={() => handleShare("facebook")}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
        >
          <Share2 size={18} />
          <span>Share FB</span>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
        >
          <ImageIcon size={18} />
          <span>View Creatives</span>
        </button>
      </div>
    </div>
  )
}
