"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { Crown, Check, Star, Zap, Gift, Lock } from "lucide-react"
import { toast } from "sonner"

const premiumFeatures = [
  {
    icon: Crown,
    title: "Exclusive Beers",
    description: "Access to rare and limited-edition craft beers",
  },
  {
    icon: Star,
    title: "Priority Delivery",
    description: "Get your orders delivered faster with priority shipping",
  },
  {
    icon: Zap,
    title: "Special Discounts",
    description: "Enjoy 15% off on all purchases year-round",
  },
  {
    icon: Gift,
    title: "Monthly Surprises",
    description: "Receive exclusive beer samples and merchandise",
  },
]

const plans = [
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 9.99,
    period: "month",
    description: "Perfect for trying out premium benefits",
    popular: false,
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 99.99,
    period: "year",
    description: "Best value - Save $20 annually",
    popular: true,
    savings: "Save $20",
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isAuthenticated, togglePremium } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/subscription")
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    togglePremium()
    toast.success("Welcome to Premium!", {
      description: "Your premium membership is now active",
    })

    setIsProcessing(false)
    router.push("/dashboard")
  }

  const handleManageSubscription = () => {
    toast.info("Subscription Management", {
      description: "This would open your subscription management portal",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 gap-1" variant="secondary">
                <Crown className="h-3 w-3" />
                Premium Membership
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl">
                Unlock the Full Beer Experience
              </h1>
              <p className="text-lg text-muted-foreground text-pretty md:text-xl">
                Get exclusive access to rare beers, special discounts, and premium perks with our membership program
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Premium Benefits</h2>
              <p className="text-muted-foreground">Everything you need for the ultimate craft beer experience</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {premiumFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Choose Your Plan</h2>
              <p className="text-muted-foreground">Select the plan that works best for you</p>
            </div>

            {user?.isPremium ? (
              <Card className="mx-auto max-w-md">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">You're a Premium Member!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enjoy all the exclusive benefits of your premium membership
                    </p>
                  </div>
                  <Button onClick={handleManageSubscription} variant="outline" className="bg-transparent">
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${selectedPlan === plan.id ? "border-primary shadow-lg" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge>Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <Badge variant="secondary" className="mt-2 w-fit">
                          {plan.savings}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">Access to exclusive premium beers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">15% discount on all purchases</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">Priority delivery service</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">Monthly exclusive samples</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">Early access to new releases</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {!user?.isPremium && (
              <div className="mt-8 text-center">
                <Button size="lg" onClick={handleSubscribe} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Subscribe Now"}
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">Cancel anytime. No long-term commitment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Premium Beers Preview */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Exclusive Premium Beers</h2>
              <p className="text-muted-foreground">A taste of what awaits premium members</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "IPA Reserve",
                  brand: "Hoppy Hills",
                  image: "/ipa-beer-bottle.jpg",
                },
                {
                  name: "Belgian Tripel",
                  brand: "Monastery Ales",
                  image: "/belgian-tripel-beer-bottle.jpg",
                },
                {
                  name: "Porter Reserve",
                  brand: "Dark Horse Brewery",
                  image: "/porter-beer-bottle.jpg",
                },
              ].map((beer, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={beer.image || "/placeholder.svg"}
                      alt={beer.name}
                      className="h-full w-full object-cover"
                    />
                    {!user?.isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-center text-white">
                          <Lock className="mx-auto mb-2 h-8 w-8" />
                          <p className="font-semibold">Premium Only</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{beer.name}</h3>
                    <p className="text-sm text-muted-foreground">{beer.brand}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes, you can cancel your premium membership at any time. Your benefits will continue until the end
                      of your billing period.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We accept all major credit cards, debit cards, and digital payment methods for your convenience.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How does the discount work?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Premium members automatically receive 15% off all purchases at checkout. The discount is applied
                      to your cart total before taxes and shipping.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">When will I receive my monthly samples?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Monthly samples are shipped on the first week of each month. You'll receive a notification when
                      your package is on its way.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
