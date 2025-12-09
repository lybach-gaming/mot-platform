"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink } from "lucide-react"

interface Material {
  id: string
  name: string
  type: "banner" | "email" | "video" | "social"
  format: string
  size: string
  downloads: number
  preview?: string
}

const materials: Material[] = [
  {
    id: "1",
    name: "Homepage Banner (1200x600)",
    type: "banner",
    format: "PNG",
    size: "2.4 MB",
    downloads: 342,
  },
  {
    id: "2",
    name: "Email Template - Promotion",
    type: "email",
    format: "HTML",
    size: "156 KB",
    downloads: 215,
  },
  {
    id: "3",
    name: "Product Demo Video",
    type: "video",
    format: "MP4",
    size: "84.5 MB",
    downloads: 128,
  },
  {
    id: "4",
    name: "Social Media Pack",
    type: "social",
    format: "ZIP",
    size: "45.2 MB",
    downloads: 456,
  },
  {
    id: "5",
    name: "Landing Page Template",
    type: "email",
    format: "HTML",
    size: "285 KB",
    downloads: 189,
  },
  {
    id: "6",
    name: "Explainer Animation",
    type: "video",
    format: "MP4",
    size: "156 MB",
    downloads: 92,
  },
]

export default function PromotionalMaterials() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "banner":
        return "bg-purple-100 text-purple-800"
      case "email":
        return "bg-blue-100 text-blue-800"
      case "video":
        return "bg-red-100 text-red-800"
      case "social":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "banner":
        return "🖼️"
      case "email":
        return "📧"
      case "video":
        return "🎬"
      case "social":
        return "📱"
      default:
        return "📄"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Promotional Materials</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download and use these ready-made promotional materials to boost your referrals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{getTypeIcon(material.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{material.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {material.format} • {material.size}
                    </p>
                  </div>
                  <Badge className={`capitalize text-xs ${getTypeColor(material.type)}`}>{material.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">⬇️ {material.downloads} downloads</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Download className="w-3 h-3 mr-1.5" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
