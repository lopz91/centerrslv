import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase
      .from("products")
      .select(`
        *,
        categories(name, slug)
      `)
      .eq("is_active", true)

    // Apply filters
    if (featured === "true") {
      query = query.eq("is_featured", true)
    }

    if (category) {
      query = query.eq("categories.name", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch products", products: [] }, { status: 500 })
    }

    const transformedProducts =
      products?.map((product) => ({
        ...product,
        category: product.categories?.name || null,
        category_slug: product.categories?.slug || null,
      })) || []

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error", products: [] }, { status: 500 })
  }
}
