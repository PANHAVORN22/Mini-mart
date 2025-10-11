"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, ShoppingCart, Lock } from "lucide-react"
import type { Beer } from "@/lib/types"
import { useCartStore } from "@/lib/cart-store"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

interface BeerCardProps {
  beer: Beer
}

export function BeerCard({ beer }: BeerCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { user } = useAuthStore()

  const handleAddToCart = () => {
    if (beer.isPremiumOnly && !user?.isPremium) {
      toast.error("Premium membership required", {
        description: "This beer is only available to premium members",
      })
      return
    }

    if (beer.stock === 0) {
      toast.error("Out of stock", {
        description: "This beer is currently unavailable",
      })
      return
    }

    addItem(beer)
    toast.success("Added to cart", {
      description: `${beer.name} has been added to your cart`,
    })
  }

  const canPurchase = !beer.isPremiumOnly || user?.isPremium

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={beer.imageUrl || "/placeholder.svg"} alt={beer.name} className="h-full w-full object-cover" />
        {beer.isPremiumOnly && (
          <Badge className="absolute right-2 top-2 gap-1" variant="secondary">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
        {beer.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-balance">{beer.name}</h3>
          <p className="text-sm text-muted-foreground">{beer.brand}</p>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{beer.description}</p>

        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{beer.type}</span>
          <span className="font-medium">{beer.abv}% ABV</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold">${beer.price.toFixed(2)}</span>
          {canPurchase ? (
            <Button size="sm" onClick={handleAddToCart} disabled={beer.stock === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              <Lock className="mr-2 h-4 w-4" />
              Premium Only
            </Button>
          )}
        </div>

        {beer.stock > 0 && beer.stock < 10 && (
          <p className="mt-2 text-xs text-muted-foreground">Only {beer.stock} left in stock</p>
        )}
      </CardContent>
    </Card>
  )
}
