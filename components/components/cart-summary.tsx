"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/lib/i18n"
import type { CartItem, Product, Profile } from "@/lib/types"

interface CartSummaryProps {
  items: (CartItem & { product: Product })[]
  language: "en" | "es"
  userProfile?: Profile | null
  onCheckout: () => void
  isProcessing?: boolean
}

export function CartSummary({ items, language, userProfile, onCheckout, isProcessing }: CartSummaryProps) {
  const t = useTranslation(language)

  const getProductPrice = (product: Product) => {
    if (userProfile?.account_type === "wholesale" && product.wholesale_price) {
      return product.wholesale_price
    }
    if (userProfile?.account_type === "contractor" && product.contractor_price) {
      return product.contractor_price
    }
    return product.price
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + getProductPrice(item.product) * item.quantity
  }, 0)

  const deliveryFee = items.reduce((sum, item) => {
    return sum + (item.product.requires_delivery ? item.product.delivery_fee * item.quantity : 0)
  }, 0)

  const taxRate = 0.0825 // Nevada sales tax rate
  const taxAmount = subtotal * taxRate
  const total = subtotal + deliveryFee + taxAmount

  if (items.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-6 text-center">
          <div className="text-zinc-400">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-lg font-medium text-white mb-2">{t.cartEmpty}</p>
            <p className="text-sm">
              {language === "es" ? "Agrega algunos productos para comenzar" : "Add some products to get started"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 sticky top-4">
      <CardHeader>
        <CardTitle className="text-white">{language === "es" ? "Resumen del Pedido" : "Order Summary"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{t.subtotal}</span>
            <span className="text-white">${subtotal.toFixed(2)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{t.deliveryFee}</span>
              <span className="text-white">${deliveryFee.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{t.tax} (8.25%)</span>
            <span className="text-white">${taxAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="bg-zinc-700" />

        <div className="flex justify-between font-semibold">
          <span className="text-white">{t.total}</span>
          <span className="text-amber-400 text-lg">${total.toFixed(2)}</span>
        </div>

        <Button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold"
        >
          {isProcessing ? t.loading : t.checkout}
        </Button>

        {userProfile?.account_type !== "retail" && (
          <div className="text-xs text-zinc-500 text-center">
            {language === "es"
              ? `Precios ${userProfile?.account_type === "contractor" ? "de contratista" : "mayoristas"} aplicados`
              : `${userProfile?.account_type === "contractor" ? "Contractor" : "Wholesale"} pricing applied`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
