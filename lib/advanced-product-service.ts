import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface ProductAnalytics {
  id: string
  product_id: string
  date: string
  views: number
  cart_additions: number
  purchases: number
  revenue: number
  conversion_rate: number
}

export interface InventoryAlert {
  id: string
  product_id: string
  alert_type: "low_stock" | "out_of_stock" | "reorder_point" | "overstock"
  threshold_value?: number
  current_stock: number
  is_active: boolean
  last_triggered?: string
  product?: {
    name_en: string
    name_es: string
    sku: string
  }
}

export interface ProductBundle {
  id: string
  name_en: string
  name_es: string
  description_en?: string
  description_es?: string
  bundle_price: number
  discount_percentage: number
  is_active: boolean
  items: BundleItem[]
}

export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  quantity: number
  product?: {
    name_en: string
    name_es: string
    price: number
    images: string[]
  }
}

export interface ProductRecommendation {
  id: string
  product_id: string
  recommended_product_id: string
  recommendation_type: "frequently_bought_together" | "similar_products" | "complementary" | "upsell"
  confidence_score: number
  recommended_product?: {
    name_en: string
    name_es: string
    price: number
    images: string[]
    sku: string
  }
}

// Server-side functions
export async function getProductAnalytics(
  productId?: string,
  startDate?: string,
  endDate?: string,
): Promise<ProductAnalytics[]> {
  const supabase = createClient()

  let query = supabase.from("product_analytics").select("*").order("date", { ascending: false })

  if (productId) {
    query = query.eq("product_id", productId)
  }

  if (startDate) {
    query = query.gte("date", startDate)
  }

  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching product analytics:", error)
    return []
  }

  return data || []
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("inventory_alerts")
    .select(`
      *,
      product:products(name_en, name_es, sku)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inventory alerts:", error)
    return []
  }

  return data || []
}

export async function getProductBundles(isActive = true): Promise<ProductBundle[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_bundles")
    .select(`
      *,
      items:bundle_items(
        *,
        product:products(name_en, name_es, price, images)
      )
    `)
    .eq("is_active", isActive)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching product bundles:", error)
    return []
  }

  return data || []
}

export async function getProductRecommendations(productId: string, type?: string): Promise<ProductRecommendation[]> {
  const supabase = createClient()

  let query = supabase
    .from("product_recommendations")
    .select(`
      *,
      recommended_product:products!product_recommendations_recommended_product_id_fkey(
        name_en, name_es, price, images, sku
      )
    `)
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("confidence_score", { ascending: false })

  if (type) {
    query = query.eq("recommendation_type", type)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching product recommendations:", error)
    return []
  }

  return data || []
}

// Client-side functions
export async function trackProductEvent(productId: string, eventType: "view" | "cart_add" | "purchase", revenue = 0) {
  try {
    const response = await fetch("/api/products/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        eventType,
        revenue,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to track product event")
    }
  } catch (error) {
    console.error("Error tracking product event:", error)
  }
}

export async function createProductBundle(bundleData: {
  name_en: string
  name_es: string
  description_en?: string
  description_es?: string
  bundle_price: number
  discount_percentage: number
  items: { product_id: string; quantity: number }[]
}) {
  const supabase = createBrowserClient()

  const { data: bundle, error: bundleError } = await supabase
    .from("product_bundles")
    .insert({
      name_en: bundleData.name_en,
      name_es: bundleData.name_es,
      description_en: bundleData.description_en,
      description_es: bundleData.description_es,
      bundle_price: bundleData.bundle_price,
      discount_percentage: bundleData.discount_percentage,
    })
    .select()
    .single()

  if (bundleError) throw bundleError

  // Add bundle items
  const bundleItems = bundleData.items.map((item) => ({
    bundle_id: bundle.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from("bundle_items").insert(bundleItems)

  if (itemsError) throw itemsError

  return bundle
}

export async function generateProductRecommendations(productId: string) {
  try {
    const response = await fetch("/api/products/recommendations/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate recommendations")
    }

    return await response.json()
  } catch (error) {
    console.error("Error generating recommendations:", error)
    throw error
  }
}

export async function getInventoryReport(startDate?: string, endDate?: string) {
  try {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    const response = await fetch(`/api/products/inventory-report?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch inventory report")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching inventory report:", error)
    throw error
  }
}
