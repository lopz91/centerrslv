"use client"

import type { Product, Profile } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Truck } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/lib/i18n"

interface ProductCardProps {
  product: Product
  language: "en" | "es"
  userProfile?: Profile | null
  onAddToCart: (productId: string, quantity: number) => void
  isAddingToCart?: boolean
}

export function ProductCard({ product, language, userProfile, onAddToCart, isAddingToCart }: ProductCardProps) {
  const t = useTranslation(language)

  const getPrice = () => {
    if (userProfile?.account_type === "wholesale" && product.wholesale_price) {
      return product.wholesale_price
    }
    if (userProfile?.account_type === "contractor" && product.contractor_price) {
      return product.contractor_price
    }
    return product.price
  }

  const getPriceLabel = () => {
    if (userProfile?.account_type === "wholesale" && product.wholesale_price) {
      return t.wholesalePrice
    }
    if (userProfile?.account_type === "contractor" && product.contractor_price) {
      return t.contractorPrice
    }
    return t.price
  }

  const productName = language === "es" ? product.name_es : product.name_en
  const productDescription = language === "es" ? product.description_es : product.description_en

  return (
    <Card className="group overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images[0] || `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(productName)}`}
          alt={productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-semibold">
              {t.outOfStock}
            </Badge>
          </div>
        )}
        {product.requires_delivery && (
          <Badge className="absolute top-2 right-2 bg-amber-400 text-black hover:bg-amber-300">
            <Truck className="h-3 w-3 mr-1" />
            Delivery
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
            {productName}
          </h3>
          {productDescription && <p className="text-sm text-zinc-400 line-clamp-2">{productDescription}</p>}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">{getPriceLabel()}</p>
              <p className="text-lg font-bold text-amber-400">${getPrice().toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">{t.sku}</p>
              <p className="text-sm font-mono text-zinc-300">{product.sku}</p>
            </div>
          </div>
          {product.stock_quantity > 0 && (
            <p className="text-xs text-emerald-400">
              {t.inStock}: {product.stock_quantity}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product.id, product.min_order_quantity)}
          disabled={product.stock_quantity === 0 || isAddingToCart}
          className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? t.loading : t.addToCart}
        </Button>
      </CardFooter>
    </Card>
  )
}
