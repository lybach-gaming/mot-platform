"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users } from "lucide-react"

interface Offer {
  id: string
  name: string
  category: string
  commission: string
  status: "active" | "coming_soon" | "paused"
  affiliates: number
  rating: number
  description: string
}

const offers: Offer[] = [
  {
    id: "1",
    name: "Premium Membership",
    category: "Software",
    commission: "30% recurring",
    status: "active",
    affiliates: 245,
    rating: 4.8,
    description: "Earn 30% commission on all premium subscriptions",
  },
  {
    id: "2",
    name: "Enterprise Plan",
    category: "Software",
    commission: "25% + bonus",
    status: "active",
    affiliates: 128,
    rating: 4.9,
    description: "Higher-value deals with performance bonuses",
  },
  {
    id: "3",
    name: "Training Course",
    category: "Education",
    commission: "$50 per sale",
    status: "active",
    affiliates: 92,
    rating: 4.6,
    description: "Fixed commission for course enrollments",
  },
  {
    id: "4",
    name: "API Access",
    category: "Developer",
    commission: "20% + revenue share",
    status: "coming_soon",
    affiliates: 45,
    rating: 4.7,
    description: "Coming soon - Advanced developer program",
  },
]

export default function AvailableOffers() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "coming_soon":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Offers</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-foreground">{offer.name}</h4>
                <p className="text-sm text-muted-foreground">{offer.category}</p>
              </div>
              <Badge className={`capitalize ${getStatusColor(offer.status)}`}>{offer.status.replace("_", " ")}</Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>

            <div className="space-y-3 mb-4 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-accent font-bold text-lg">{offer.commission}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{offer.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {offer.affiliates} active affiliates
              </div>
            </div>

            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={offer.status === "coming_soon"}
            >
              {offer.status === "coming_soon" ? "Coming Soon" : "Promote This Offer"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
