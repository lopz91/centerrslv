"use client"

import type { CartItem as CartItemType, Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/lib/i18n"
import { useState } from "react"

interface CartItemProps {
  item: CartItemType & { product: Product }
  language: "en" | "es"
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  isUpdating?: boolean
}

export function CartItem({ item, language, onUpdateQuantity, onRemoveItem, isUpdating }: CartItemProps) {
  const t = useTranslation(language)
  const [quantity, setQuantity] = useState(item.quantity)

  const productName = language === "es" ? item.product.name_es : item.product.name_en
  const totalPrice = item.product.price * item.quantity

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= item.product.min_order_quantity && newQuantity <= item.product.stock_quantity) {
      setQuantity(newQuantity)
      onUpdateQuantity(item.id, newQuantity)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={
                item.product.images[0] || `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(productName)}`
              }
              alt={productName}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-white">{productName}</h4>
                <p className="text-sm text-zinc-400">
                  {t.sku}: {item.product.sku}
                </p>
                <p className="text-sm font-semibold text-amber-400">${item.product.price.toFixed(2)} each</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                disabled={isUpdating}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= item.product.min_order_quantity || isUpdating}
                  className="h-8 w-8 p-0 border-zinc-700 hover:border-amber-400"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = Number.parseInt(e.target.value) || 1
                    handleQuantityChange(newQuantity)
                  }}
                  className="w-16 h-8 text-center border-zinc-700 bg-zinc-800"
                  min={item.product.min_order_quantity}
                  max={item.product.stock_quantity}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= item.product.stock_quantity || isUpdating}
                  className="h-8 w-8 p-0 border-zinc-700 hover:border-amber-400"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right">
                <p className="text-sm text-zinc-400">{t.total}</p>
                <p className="font-bold text-amber-400">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
