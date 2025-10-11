"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/lib/hooks/use-user"
import { StockManagement } from "@/components/admin/stock-management"
import { SalesOverview } from "@/components/admin/sales-overview"
import { UserManagement } from "@/components/admin/user-management"
import { Package, TrendingUp, Users, DollarSign } from "lucide-react"
import { getAdminStats } from "@/lib/actions/admin"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useUser()
  const [stats, setStats] = useState({
    totalStock: 0,
    totalRevenue: 0,
    orderCount: 0,
    userCount: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    const fetchStats = async () => {
      const adminStats = await getAdminStats()
      setStats(adminStats)
      setIsLoadingStats(false)
    }

    if (user?.role === "admin") {
      fetchStats()
    }
  }, [user])

  if (isLoading || isLoadingStats) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b bg-muted/50 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage your beer inventory, sales, and users</p>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats Overview */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStock}</div>
                <p className="text-xs text-muted-foreground">Units in inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All time revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orderCount}</div>
                <p className="text-xs text-muted-foreground">Completed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userCount}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="stock" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <StockManagement />
            </TabsContent>

            <TabsContent value="sales">
              <SalesOverview />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
