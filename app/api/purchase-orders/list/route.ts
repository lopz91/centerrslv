import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { listPurchaseOrders } from "@/lib/purchase-order-utils"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you'd check if user has admin privileges here
    // For now, we'll allow any authenticated user for demo purposes

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const result = await listPurchaseOrders({
      status,
      page,
      limit,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      purchaseOrders: result.purchaseOrders,
    })
  } catch (error) {
    console.error("Error in purchase orders list API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
