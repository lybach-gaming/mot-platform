"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Download, Copy, Code } from "lucide-react"

interface Creative {
  id: string
  title: string
  size: string
  format: string
  preview: string
  language: "en" | "fr"
}

const CREATIVES: Creative[] = [
  {
    id: "creative_1",
    title: "Welcome to MOT",
    size: "1200x628",
    format: "og-image",
    preview: "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=1200&h=628&fit=crop",
    language: "en",
  },
  {
    id: "creative_2",
    title: "Affiliate Earnings",
    size: "1080x1080",
    format: "social",
    preview: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1080&h=1080&fit=crop",
    language: "en",
  },
  {
    id: "creative_3",
    title: "Limited Time Offer",
    size: "1080x1920",
    format: "story",
    preview: "https://images.unsplash.com/photo-1432888498319-5a8192f2a694?w=1080&h=1920&fit=crop",
    language: "en",
  },
  {
    id: "creative_4",
    title: "Bienvenue MOT",
    size: "1200x628",
    format: "og-image",
    preview: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=628&fit=crop",
    language: "fr",
  },
]

const CAPTION_EN = `Earn more with MOT Affiliate Hub! Start earning up to 5% commission on every referral. Join thousands of successful affiliates. #MOTAffiliate`
const CAPTION_FR = `Gagnez plus avec MOT Affiliate Hub! Commencez à gagner jusqu'à 5% de commission sur chaque parrainage. Rejoignez des milliers d'affiliés réussis. #MOTAffiliate`

export default function CreativesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "fr">("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [showWidgetComposer, setShowWidgetComposer] = useState(false)

  const filteredCreatives = CREATIVES.filter(
    (c) => c.language === selectedLanguage && c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Creatives & Widget Hub</h1>
          <button
            onClick={() => setShowWidgetComposer(!showWidgetComposer)}
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-bold"
          >
            {showWidgetComposer ? "Back to Creatives" : "Widget Composer"}
          </button>
        </div>

        {!showWidgetComposer ? (
          <>
            {/* Language & Search */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLanguage("en")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedLanguage === "en"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setSelectedLanguage("fr")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedLanguage === "fr"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  FR
                </button>
              </div>
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search creatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Creatives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatives.map((creative) => (
                <div key={creative.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <img
                    src={creative.preview || "/placeholder.svg"}
                    alt={creative.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{creative.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {creative.size} • {creative.format}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium text-sm">
                        <Download size={16} />
                        Download
                      </button>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm">
                          <Copy size={16} />
                          Caption
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm">
                          <Code size={16} />
                          Embed
                        </button>
                      </div>
                    </div>

                    {/* Caption Preview */}
                    <div className="p-2 bg-muted/50 rounded text-xs text-foreground">
                      <p className="line-clamp-2">{selectedLanguage === "en" ? CAPTION_EN : CAPTION_FR}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <WidgetComposer />
        )}
      </div>
    </DashboardLayout>
  )
}

function WidgetComposer() {
  const [widgetType, setWidgetType] = useState("quiz")
  const [theme, setTheme] = useState("midnight")
  const [size, setSize] = useState("medium")
  const [language, setLanguage] = useState("en")

  const widgetCode = `<script src="https://widget.mot.affiliate/embed.js"></script>
<div class="mot-widget" data-type="${widgetType}" data-theme="${theme}" data-size="${size}" data-language="${language}"></div>`

  const wpShortcode = `[mot_widget type="${widgetType}" theme="${theme}" size="${size}" language="${language}"]`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Widget Configuration</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Widget Type</label>
            <select
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-accent"
            >
              <option value="quiz">Quiz Widget</option>
              <option value="category">Category Selector</option>
              <option value="banner">Banner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {["midnight", "clean", "retro"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                    theme === t ? "bg-accent text-accent-foreground" : "border border-border hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Size</label>
            <div className="grid grid-cols-3 gap-2">
              {["small", "medium", "large"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                    size === s ? "bg-accent text-accent-foreground" : "border border-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Language</label>
            <div className="flex gap-2">
              {["en", "fr"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors uppercase ${
                    language === l ? "bg-accent text-accent-foreground" : "border border-border hover:bg-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-center min-h-64">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Widget Preview</p>
            <div className={`rounded-lg ${theme === "midnight" ? "bg-slate-900" : "bg-slate-100"} p-4`}>
              <p className="text-xs font-semibold">Your {widgetType} widget here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Embed Code</h3>
          <div className="flex items-start gap-3">
            <pre className="flex-1 bg-muted p-3 rounded text-xs overflow-x-auto text-foreground font-mono">
              {widgetCode}
            </pre>
            <button className="p-2 hover:bg-muted rounded transition-colors">
              <Copy size={18} />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">WordPress Shortcode</h3>
          <div className="flex items-start gap-3">
            <pre className="flex-1 bg-muted p-3 rounded text-xs overflow-x-auto text-foreground font-mono">
              {wpShortcode}
            </pre>
            <button className="p-2 hover:bg-muted rounded transition-colors">
              <Copy size={18} />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Facebook Deep Link</h3>
          <div className="flex items-start gap-3">
            <input
              type="text"
              value={`https://mot.affiliate/ref/john-doe?widget=${widgetType}`}
              readOnly
              className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-mono"
            />
            <button className="px-3 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors">
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
