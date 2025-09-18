"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { useTranslation } from "@/lib/i18n"
import type { Product } from "@/lib/types"

interface FeaturedProductsSectionProps {
  language: "en" | "es"
}

export function FeaturedProductsSection({ language }: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslation(language)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/products?featured=true&limit=8")
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
        // Set some mock data for now
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const handleAddToCart = (productId: string, quantity: number) => {
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", productId, quantity)
  }

  return (
    <section className="py-16 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === "es" ? "Productos Destacados" : "Featured Products"}
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            {language === "es"
              ? "Descubre nuestra selección de productos más populares para tu proyecto de paisajismo"
              : "Discover our selection of most popular products for your landscaping project"}
          </p>
        </div>

        <ProductGrid products={products} language={language} onAddToCart={handleAddToCart} isLoading={isLoading} />

        {!isLoading && products.length > 0 && (
          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-colors"
            >
              {language === "es" ? "Ver Todos los Productos" : "View All Products"}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
