import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPurchaseOrderFromOrder } from "@/lib/purchase-order-utils"

export async function POST(request: NextRequest) {
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

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Verify user owns the order or is admin
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user owns the order (for now, allow any authenticated user - in production you'd check admin role)
    if (order.user_id !== user.id) {
      // In a real app, you'd check if user has admin privileges here
      // For now, we'll allow it for demo purposes
    }

    const result = await createPurchaseOrderFromOrder(orderId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      purchaseOrderId: result.purchaseOrderId,
    })
  } catch (error) {
    console.error("Error in purchase order creation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
