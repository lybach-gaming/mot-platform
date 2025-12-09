"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"

export default function QuickLinkGenerator() {
  const [offerName, setOfferName] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (offerName) {
      const link = `https://affiliate.hub/ref/${offerName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      setGeneratedLink(link)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Link Generator</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="offer-name" className="mb-2">
            Offer Name
          </Label>
          <Input
            id="offer-name"
            placeholder="e.g., Premium Membership"
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
          />
        </div>

        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleGenerate}
          disabled={!offerName}
        >
          Generate Link
        </Button>

        {generatedLink && (
          <div className="space-y-2">
            <Label>Your Referral Link</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-muted text-foreground font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to clipboard">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Share this link to start earning referral commissions</p>
          </div>
        )}
      </div>
    </Card>
  )
}
