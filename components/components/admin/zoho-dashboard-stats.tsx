"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  syncedToday: number
  totalCustomers: number
  linkedCustomers: number
  pendingOrders: number
  lastSyncTime: string | null
}

export function ZohoDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/zoho/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch Zoho stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">Failed to load statistics</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            Synced from Zoho Books
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Synced Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.syncedToday}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            Product updates
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">CRM Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.linkedCustomers}/{stats.totalCustomers}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {Math.round((stats.linkedCustomers / stats.totalCustomers) * 100)}% linked
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Last Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleTimeString() : "Never"}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.pendingOrders > 0 && (
              <Badge variant="outline" className="text-xs">
                {stats.pendingOrders} pending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
