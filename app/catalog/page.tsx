"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BeerCard } from "@/components/beer-card"
import { BeerFilters } from "@/components/beer-filters"
import { useUser } from "@/lib/hooks/use-user"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Beer {
  id: string
  name: string
  brand: string
  type: string
  description: string
  price: number
  abv: number
  volume: number
  stock: number
  imageUrl: string
  isPremiumOnly: boolean
}

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [beers, setBeers] = useState<Beer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20])
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  useEffect(() => {
    const fetchBeers = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("beers").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching beers:", error)
        setIsLoading(false)
        return
      }

      const formattedBeers = data.map((beer) => ({
        id: beer.id,
        name: beer.name,
        brand: beer.name.split(" ")[0],
        type: beer.type,
        description: beer.description || "",
        price: Number(beer.price),
        abv: Number(beer.alcohol_content) || 0,
        volume: beer.volume || 355,
        stock: beer.stock,
        imageUrl: beer.image_url || "/placeholder.svg",
        isPremiumOnly: beer.is_premium,
      }))

      setBeers(formattedBeers)
      setIsLoading(false)
    }

    fetchBeers()
  }, [])

  const filteredBeers = useMemo(() => {
    return beers.filter((beer) => {
      // Search filter
      const matchesSearch =
        beer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beer.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beer.type.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = selectedType === "all" || beer.type.toLowerCase() === selectedType.toLowerCase()

      // Price filter
      const matchesPrice = beer.price >= priceRange[0] && beer.price <= priceRange[1]

      // Premium filter
      const matchesPremium = !showPremiumOnly || beer.isPremiumOnly

      // Hide premium beers if user is not premium
      const canView = !beer.isPremiumOnly || user?.isPremium

      return matchesSearch && matchesType && matchesPrice && matchesPremium && canView
    })
  }, [beers, searchQuery, selectedType, priceRange, showPremiumOnly, user])

  const beerTypes = ["all", ...Array.from(new Set(beers.map((beer) => beer.type)))]

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading beers...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b bg-muted/50 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Beer Catalog</h1>
            <p className="mt-2 text-muted-foreground">Browse our complete selection of craft beers</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <BeerFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                beerTypes={beerTypes}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                showPremiumOnly={showPremiumOnly}
                onPremiumOnlyChange={setShowPremiumOnly}
              />
            </aside>

            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBeers.length} of {beers.length} beers
                </p>
              </div>

              {filteredBeers.length === 0 ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <p className="text-lg font-medium">No beers found</p>
                    <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBeers.map((beer) => (
                    <BeerCard key={beer.id} beer={beer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
