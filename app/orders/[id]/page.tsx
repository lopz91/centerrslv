"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PurchaseOrderManager } from "@/components/purchase-order-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import type { Order, OrderItem, Product } from "@/lib/types"
import { Package, Calendar, MapPin, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<(OrderItem & { product: Product })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const t = useTranslation(language)
  const supabase = createClient()
  const orderId = params.id as string

  useEffect(() => {
    checkAuthAndLoadOrder()
  }, [orderId])

  const checkAuthAndLoadOrder = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/orders/" + orderId)
        return
      }

      setIsLoggedIn(true)

      // Load order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single()

      if (orderError || !orderData) {
        console.error("Error loading order:", orderError)
        router.push("/dashboard/orders")
        return
      }

      setOrder(orderData)

      // Load order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          products!inner(*)
        `)
        .eq("order_id", orderId)

      if (itemsError) {
        console.error("Error loading order items:", itemsError)
      } else {
        setOrderItems(itemsData || [])
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth/login?redirect=/orders/" + orderId)
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

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder({ ...order, status: newStatus })
    }
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

  if (!order) {
    return (
      <div className="min-h-screen bg-black">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              {language === "es" ? "Pedido no encontrado" : "Order not found"}
            </h2>
            <Link href="/dashboard/orders">
              <Button className="bg-amber-400 hover:bg-amber-300 text-black">
                {language === "es" ? "Volver a Pedidos" : "Back to Orders"}
              </Button>
            </Link>
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
        <div className="space-y-6">
          {/* Back Button */}
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="text-zinc-400 hover:text-amber-400 p-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "es" ? "Volver a Pedidos" : "Back to Orders"}
            </Button>
          </Link>

          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">#{order.order_number}</h1>
              <p className="text-zinc-400 flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-400" />
                    {language === "es" ? "Productos" : "Items"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-b-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-white">
                            {language === "es" ? item.product.name_es : item.product.name_en}
                          </h4>
                          <p className="text-sm text-zinc-400">
                            {language === "es" ? "Cantidad" : "Quantity"}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">${item.total_price.toFixed(2)}</p>
                          <p className="text-sm text-zinc-400">${item.unit_price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Order Management */}
              <PurchaseOrderManager
                orderId={order.id}
                orderNumber={order.order_number}
                language={language}
                zohoPurchaseOrderId={order.zoho_purchase_order_id || undefined}
                zohoPurchaseOrderNumber={order.zoho_purchase_order_number || undefined}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white">{language === "es" ? "Resumen" : "Summary"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t.subtotal}</span>
                      <span className="text-white">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t.deliveryFee}</span>
                      <span className="text-white">${order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t.tax}</span>
                      <span className="text-white">${order.tax_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator className="bg-zinc-700" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">{t.total}</span>
                    <span className="text-amber-400 text-lg">${order.total_amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-400" />
                    {language === "es" ? "Dirección de Entrega" : "Delivery Address"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.delivery_address && (
                    <div className="text-sm text-zinc-300 space-y-1">
                      <p>
                        {order.delivery_address.firstName} {order.delivery_address.lastName}
                      </p>
                      {order.delivery_address.company && <p>{order.delivery_address.company}</p>}
                      <p>{order.delivery_address.address}</p>
                      <p>
                        {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zip}
                      </p>
                      <p>{order.delivery_address.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-400" />
                    {language === "es" ? "Información de Pago" : "Payment Info"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{language === "es" ? "Estado" : "Status"}</span>
                      <span className="text-white capitalize">{order.payment_status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{language === "es" ? "Moneda" : "Currency"}</span>
                      <span className="text-white">{order.currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
