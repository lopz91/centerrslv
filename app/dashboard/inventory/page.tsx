"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, TrendingUp, Package, BarChart3, RefreshCw } from "lucide-react"
import type { InventoryAlert, ProductAnalytics } from "@/lib/advanced-product-service"
import { createClient } from "@/lib/supabase/client"

export default function InventoryDashboard() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch inventory alerts
      const { data: alertsData } = await supabase
        .from("inventory_alerts")
        .select(`
          *,
          product:products(name_en, name_es, sku)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      // Fetch recent analytics
      const { data: analyticsData } = await supabase
        .from("product_analytics")
        .select("*")
        .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .order("date", { ascending: false })

      setAlerts(alertsData || [])
      setAnalytics(analyticsData || [])
    } catch (error) {
      console.error("Error fetching inventory data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "out_of_stock":
        return "destructive"
      case "low_stock":
        return "secondary"
      case "reorder_point":
        return "default"
      default:
        return "outline"
    }
  }

  const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0)
  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0)
  const totalPurchases = analytics.reduce((sum, item) => sum + item.purchases, 0)
  const avgConversionRate =
    analytics.length > 0 ? analytics.reduce((sum, item) => sum + item.conversion_rate, 0) / analytics.length : 0

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === "es" ? "Panel de Inventario" : "Inventory Dashboard"}
            </h1>
            <p className="text-gray-300">
              {language === "es"
                ? "Gestiona tu inventario y analiza el rendimiento de productos"
                : "Manage your inventory and analyze product performance"}
            </p>
          </div>
          <Button onClick={fetchData} disabled={loading} className="bg-yellow-400 hover:bg-yellow-300 text-black">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {language === "es" ? "Actualizar" : "Refresh"}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{language === "es" ? "Alertas Activas" : "Active Alerts"}</p>
                  <p className="text-2xl font-bold text-white">{alerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{language === "es" ? "Ingresos (30d)" : "Revenue (30d)"}</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{language === "es" ? "Vistas (30d)" : "Views (30d)"}</p>
                  <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {language === "es" ? "Conversión Promedio" : "Avg Conversion"}
                  </p>
                  <p className="text-2xl font-bold text-white">{(avgConversionRate * 100).toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              {language === "es" ? "Alertas" : "Alerts"}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              {language === "es" ? "Análisis" : "Analytics"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  {language === "es" ? "Alertas de Inventario" : "Inventory Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">{language === "es" ? "No hay alertas activas" : "No active alerts"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <div>
                            <h4 className="font-semibold text-white">
                              {language === "es" ? alert.product?.name_es : alert.product?.name_en}
                            </h4>
                            <p className="text-sm text-gray-400">SKU: {alert.product?.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              {language === "es" ? "Stock Actual" : "Current Stock"}
                            </p>
                            <p className="font-semibold text-white">{alert.current_stock}</p>
                          </div>
                          <Badge variant={getAlertColor(alert.alert_type)}>
                            {alert.alert_type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  {language === "es" ? "Análisis de Productos" : "Product Analytics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.slice(0, 10).map((item) => (
                    <div
                      key={`${item.product_id}-${item.date}`}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.date}</p>
                        <p className="text-sm text-gray-400">Product ID: {item.product_id.slice(0, 8)}...</p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-400">Views</p>
                          <p className="font-semibold text-white">{item.views}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cart Adds</p>
                          <p className="font-semibold text-white">{item.cart_additions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Purchases</p>
                          <p className="font-semibold text-white">{item.purchases}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Revenue</p>
                          <p className="font-semibold text-yellow-400">${item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer language={language} />
    </div>
  )
}
