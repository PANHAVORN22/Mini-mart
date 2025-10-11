"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/use-user"
import { getUserOrders } from "@/lib/actions/orders"
import { Package, ShoppingBag, Crown, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const userOrders = await getUserOrders(user.id)
        setOrders(userOrders)
        setIsLoadingOrders(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  if (isLoading || isLoadingOrders) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b bg-muted/50 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">Lifetime orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All time spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Membership</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.isPremium ? "Premium" : "Standard"}</div>
                <p className="text-xs text-muted-foreground">Current plan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Account Type</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user?.role}</div>
                <p className="text-xs text-muted-foreground">User role</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date(user?.createdAt || "").toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {user?.isPremium ? (
                    <Badge className="gap-1">
                      <Crown className="h-3 w-3" />
                      Premium Member
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Standard Member</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/catalog" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    Browse Catalog
                  </Button>
                </Link>
                <Link href="/orders" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    View Orders
                  </Button>
                </Link>
                {!user?.isPremium && (
                  <Link href="/subscription" className="block">
                    <Button className="w-full">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link href="/admin" className="block">
                    <Button className="w-full" variant="secondary">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {orders.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                          className="mt-1"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/orders" className="mt-4 block">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
