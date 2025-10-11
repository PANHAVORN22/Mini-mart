"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

interface BeerFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  beerTypes: string[]
  priceRange: [number, number]
  onPriceRangeChange: (value: [number, number]) => void
  showPremiumOnly: boolean
  onPremiumOnlyChange: (value: boolean) => void
}

export function BeerFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  beerTypes,
  priceRange,
  onPriceRangeChange,
  showPremiumOnly,
  onPremiumOnlyChange,
}: BeerFiltersProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search beers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Beer Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedType} onValueChange={onTypeChange}>
            {beerTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type} className="cursor-pointer capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            min={0}
            max={20}
            step={1}
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox id="premium" checked={showPremiumOnly} onCheckedChange={onPremiumOnlyChange} />
            <Label htmlFor="premium" className="cursor-pointer text-sm">
              Premium beers only
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
