import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { SMSService } from "@/lib/sms-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Verify admin access (you might want to implement proper admin authentication)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status, customMessage } = body

    // Get order and customer details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (
          full_name,
          phone
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.profiles?.phone) {
      return NextResponse.json({ error: "Customer phone number not available" }, { status: 400 })
    }

    // Send SMS notification
    const smsService = new SMSService()
    const message =
      customMessage || smsService.generateOrderStatusMessage(status, order.id, order.profiles.full_name || "Customer")

    const smsResult = await smsService.sendSMS({
      to: order.profiles.phone,
      message,
      orderId: order.id,
    })

    if (smsResult.success) {
      // Log the SMS notification
      await supabase.from("order_notifications").insert({
        order_id: orderId,
        notification_type: "sms",
        message,
        phone_number: order.profiles.phone,
        status: "sent",
        message_id: smsResult.messageId,
        created_at: new Date().toISOString(),
      })

      // Update order status if provided
      if (status && status !== order.status) {
        await supabase
          .from("orders")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
      }

      return NextResponse.json({
        success: true,
        messageId: smsResult.messageId,
      })
    } else {
      // Log the failed SMS attempt
      await supabase.from("order_notifications").insert({
        order_id: orderId,
        notification_type: "sms",
        message,
        phone_number: order.profiles.phone,
        status: "failed",
        error_message: smsResult.error,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json(
        {
          success: false,
          error: smsResult.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("SMS notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
