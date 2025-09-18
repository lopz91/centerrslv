"use client"

import type { Product, Profile } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface ProductGridProps {
  products: Product[]
  language: "en" | "es"
  userProfile?: Profile | null
  onAddToCart: (productId: string, quantity: number) => void
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  isLoadingMore?: boolean
  addingToCartId?: string
}

export function ProductGrid({
  products,
  language,
  userProfile,
  onAddToCart,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
  addingToCartId,
}: ProductGridProps) {
  const t = useTranslation(language)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <span className="ml-2 text-zinc-400">{t.loading}</span>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {language === "es" ? "No se encontraron productos" : "No products found"}
          </h3>
          <p className="text-zinc-400">
            {language === "es" ? "Intenta ajustar tus filtros de búsqueda" : "Try adjusting your search filters"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            language={language}
            userProfile={userProfile}
            onAddToCart={onAddToCart}
            isAddingToCart={addingToCartId === product.id}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t.loading}
              </>
            ) : language === "es" ? (
              "Cargar Más"
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
