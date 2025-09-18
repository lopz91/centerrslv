"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/types"
import { Package, Calendar, DollarSign, Truck } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const t = useTranslation(language)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoadOrders()
  }, [])

  const checkAuthAndLoadOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/dashboard/orders")
        return
      }

      setIsLoggedIn(true)

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading orders:", error)
      } else {
        setOrders(ordersData || [])
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth/login?redirect=/dashboard/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
      case "confirmed":
        return "bg-blue-400/10 text-blue-400 border-blue-400/20"
      case "processing":
        return "bg-purple-400/10 text-purple-400 border-purple-400/20"
      case "shipped":
        return "bg-amber-400/10 text-amber-400 border-amber-400/20"
      case "delivered":
        return "bg-green-400/10 text-green-400 border-green-400/20"
      case "cancelled":
        return "bg-red-400/10 text-red-400 border-red-400/20"
      default:
        return "bg-zinc-400/10 text-zinc-400 border-zinc-400/20"
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      en: {
        pending: "Pending",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
      es: {
        pending: "Pendiente",
        confirmed: "Confirmado",
        processing: "Procesando",
        shipped: "Enviado",
        delivered: "Entregado",
        cancelled: "Cancelado",
      },
    }
    return statusMap[language][status as keyof typeof statusMap.en] || status
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">{t.dashboard}</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardNav language={language} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-400" />
                  {language === "es" ? "Mis Pedidos" : "My Orders"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {language === "es" ? "No tienes pedidos aún" : "No orders yet"}
                    </h3>
                    <p className="text-zinc-400 mb-6">
                      {language === "es"
                        ? "Cuando realices tu primer pedido, aparecerá aquí"
                        : "When you place your first order, it will appear here"}
                    </p>
                    <Link href="/products">
                      <Button className="bg-amber-400 hover:bg-amber-300 text-black">
                        {language === "es" ? "Explorar Productos" : "Browse Products"}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-zinc-700 bg-zinc-800/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-white">#{order.order_number}</h4>
                              <p className="text-sm text-zinc-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-amber-400" />
                              <div>
                                <p className="text-sm text-zinc-400">{t.total}</p>
                                <p className="font-semibold text-white">${order.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-amber-400" />
                              <div>
                                <p className="text-sm text-zinc-400">
                                  {language === "es" ? "Tarifa de Entrega" : "Delivery Fee"}
                                </p>
                                <p className="font-semibold text-white">${order.delivery_fee.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-amber-400" />
                              <div>
                                <p className="text-sm text-zinc-400">
                                  {language === "es" ? "Estado de Pago" : "Payment Status"}
                                </p>
                                <p className="font-semibold text-white capitalize">{order.payment_status}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Link href={`/orders/${order.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-zinc-600 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
                              >
                                {language === "es" ? "Ver Detalles" : "View Details"}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
