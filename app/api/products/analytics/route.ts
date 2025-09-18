import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { productId, eventType, revenue = 0 } = await request.json()

    if (!productId || !eventType) {
      return NextResponse.json({ error: "Product ID and event type are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Call the database function to update analytics
    const { error } = await supabase.rpc("update_product_analytics", {
      p_product_id: productId,
      p_event_type: eventType,
      p_revenue: revenue,
    })

    if (error) {
      console.error("Error updating product analytics:", error)
      return NextResponse.json({ error: "Failed to update analytics" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

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
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
