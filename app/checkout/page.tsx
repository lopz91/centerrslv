"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout-form"
import { CartSummary } from "@/components/cart-summary"
import { useTranslation } from "@/lib/i18n"
import { getCartItems, clearCart } from "@/lib/cart-utils"
import type { CartItem as CartItemType, Product, Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CheckoutPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [cartItems, setCartItems] = useState<(CartItemType & { product: Product })[]>([])
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const t = useTranslation(language)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/checkout")
        return
      }

      setIsLoggedIn(true)

      // Load user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setUserProfile(profile)
      }

      // Load cart items
      const items = await getCartItems()

      if (items.length === 0) {
        router.push("/cart")
        return
      }

      setCartItems(items)
    } catch (error) {
      console.error("Error loading checkout data:", error)
      router.push("/cart")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderSubmit = async (orderData: any) => {
    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Calculate order totals
      const getProductPrice = (product: Product) => {
        if (userProfile?.account_type === "wholesale" && product.wholesale_price) {
          return product.wholesale_price
        }
        if (userProfile?.account_type === "contractor" && product.contractor_price) {
          return product.contractor_price
        }
        return product.price
      }

      const subtotal = cartItems.reduce((sum, item) => {
        return sum + getProductPrice(item.product) * item.quantity
      }, 0)

      const deliveryFee = cartItems.reduce((sum, item) => {
        return sum + (item.product.requires_delivery ? item.product.delivery_fee * item.quantity : 0)
      }, 0)

      const taxRate = 0.0825
      const taxAmount = subtotal * taxRate
      const totalAmount = subtotal + deliveryFee + taxAmount

      // Generate order number
      const orderNumber = `LV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: "pending",
          subtotal,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          currency: "USD",
          payment_status: "pending",
          delivery_address: {
            firstName: orderData.deliveryFirstName,
            lastName: orderData.deliveryLastName,
            company: orderData.deliveryCompany,
            address: orderData.deliveryAddress,
            city: orderData.deliveryCity,
            state: orderData.deliveryState,
            zip: orderData.deliveryZip,
            phone: orderData.deliveryPhone,
          },
          billing_address: orderData.sameAsDelivery
            ? null
            : {
                firstName: orderData.billingFirstName,
                lastName: orderData.billingLastName,
                company: orderData.billingCompany,
                address: orderData.billingAddress,
                city: orderData.billingCity,
                state: orderData.billingState,
                zip: orderData.billingZip,
                phone: orderData.billingPhone,
              },
          notes: orderData.notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: getProductPrice(item.product),
        total_price: getProductPrice(item.product) * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      await clearCart()

      // Show success message
      toast.success(language === "es" ? "Pedido realizado exitosamente" : "Order placed successfully")

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error processing order:", error)
      toast.error(language === "es" ? "Error al procesar el pedido" : "Error processing order")
    } finally {
      setIsProcessing(false)
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

  return (
    <div className="min-h-screen bg-black">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        cartItemCount={cartItems.length}
        isLoggedIn={isLoggedIn}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {language === "es" ? "Finalizar Compra" : "Checkout"}
            </h1>
            <p className="text-zinc-400">
              {language === "es"
                ? "Completa tu información para finalizar el pedido"
                : "Complete your information to finalize your order"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <CheckoutForm
                language={language}
                userProfile={userProfile}
                onSubmit={handleOrderSubmit}
                isProcessing={isProcessing}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                items={cartItems}
                language={language}
                userProfile={userProfile}
                onCheckout={() => {}} // Not used in checkout page
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
