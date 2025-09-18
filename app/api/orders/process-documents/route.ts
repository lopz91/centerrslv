import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { processOrderDocuments } from "@/lib/zoho-books-documents"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, orderStatus, paymentStatus } = body

    // Verify order exists and user has access
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, payment_status")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is admin or order owner
    const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single()

    const isAdmin = profile?.account_type === "admin"
    const isOwner = order.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Process documents based on status changes
    const result = await processOrderDocuments(orderId, orderStatus, paymentStatus)

    // Update order status if provided
    if (orderStatus && orderStatus !== order.status) {
      await supabase.from("orders").update({ status: orderStatus }).eq("id", orderId)
    }

    if (paymentStatus && paymentStatus !== order.payment_status) {
      await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId)
    }

    return NextResponse.json({
      success: result.success,
      documentsCreated: result.documentsCreated,
      errors: result.errors,
    })
  } catch (error) {
    console.error("Error processing order documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
