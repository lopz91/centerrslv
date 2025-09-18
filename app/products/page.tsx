"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductFilters } from "@/components/product-filters"
import { ProductGrid } from "@/components/product-grid"
import { useTranslation } from "@/lib/i18n"
import type { Product, Category } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ProductsPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [addingToCartId, setAddingToCartId] = useState<string>("")
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<{
    search?: string
    categoryId?: string
    zipCode?: string
    sortBy?: string
  }>({})

  const t = useTranslation(language)
  const supabase = createClient()
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    loadCategories()
    loadProducts(true)
  }, [filters])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadProducts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true)
        setCurrentPage(0)
      } else {
        setIsLoadingMore(true)
      }

      const page = reset ? 0 : currentPage + 1
      const offset = page * ITEMS_PER_PAGE

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId)
      }

      if (filters.search) {
        query = query.or(
          `name_en.ilike.%${filters.search}%,name_es.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%,description_es.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`,
        )
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true })
          break
        case "price-high":
          query = query.order("price", { ascending: false })
          break
        case "name":
          query = query.order("name_en", { ascending: true })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw error

      let filteredProducts = data || []

      // Apply zip code filtering if specified
      if (filters.zipCode && filteredProducts.length > 0) {
        const productIds = filteredProducts.map((p) => p.id)

        const { data: restrictions } = await supabase
          .from("zip_code_restrictions")
          .select("product_id, is_available")
          .in("product_id", productIds)
          .eq("zip_code", filters.zipCode)

        if (restrictions && restrictions.length > 0) {
          const availableProductIds = new Set(restrictions.filter((r) => r.is_available).map((r) => r.product_id))

          filteredProducts = filteredProducts.filter((product) => {
            const hasRestrictions = restrictions.some((r) => r.product_id === product.id)
            if (hasRestrictions) {
              return availableProductIds.has(product.id)
            }
            return true
          })
        }
      }

      if (reset) {
        setProducts(filteredProducts)
      } else {
        setProducts((prev) => [...prev, ...filteredProducts])
      }

      setCurrentPage(page)
      setHasMore(filteredProducts.length === ITEMS_PER_PAGE && (count || 0) > (page + 1) * ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error(language === "es" ? "Error al cargar productos" : "Error loading products")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleAddToCart = async (productId: string, quantity: number) => {
    setAddingToCartId(productId)

    try {
      // This would normally check if user is logged in and add to cart
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast.success(language === "es" ? "Producto agregado al carrito" : "Product added to cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error(language === "es" ? "Error al agregar al carrito" : "Error adding to cart")
    } finally {
      setAddingToCartId("")
    }
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {language === "es" ? "Catálogo de Productos" : "Product Catalog"}
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {language === "es"
                ? "Descubre nuestra amplia selección de productos para paisajismo profesional"
                : "Discover our wide selection of professional landscaping products"}
            </p>
          </div>

          {/* Filters */}
          <ProductFilters
            categories={categories}
            language={language}
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Results Count */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <p className="text-zinc-400">
                {language === "es" ? `${products.length} productos encontrados` : `${products.length} products found`}
              </p>
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid
            products={products}
            language={language}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => loadProducts(false)}
            isLoadingMore={isLoadingMore}
            addingToCartId={addingToCartId}
          />
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
