import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PaymentProcessor } from "@/lib/payment-processor"

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
    const { orderId, paymentMethod, billingAddress } = body

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 })
    }

    // Process payment
    const paymentProcessor = new PaymentProcessor()
    const paymentResult = await paymentProcessor.processPayment({
      amount: order.total_amount,
      currency: "USD",
      orderId: order.id,
      customerId: user.id,
      description: `Landscape Center Order #${order.id}`,
      billingAddress,
    })

    if (paymentResult.success) {
      // Update order with payment information
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed", // Update status to confirmed when payment is successful
          payment_method: paymentMethod,
          transaction_id: paymentResult.transactionId,
          auth_code: paymentResult.authCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Failed to update order:", updateError)
        // Note: Payment was successful but order update failed
        // This should trigger an alert for manual reconciliation
      }

      try {
        const { processOrderDocuments } = await import("@/lib/zoho-books-documents")
        const documentResult = await processOrderDocuments(orderId, "confirmed", "paid")

        if (!documentResult.success) {
          console.error("Failed to create Zoho documents:", documentResult.errors)
          // Log errors but don't fail the payment response
        }
      } catch (docError) {
        console.error("Error processing Zoho documents:", docError)
        // Log error but don't fail the payment response
      }

      return NextResponse.json({
        success: true,
        transactionId: paymentResult.transactionId,
        receiptUrl: paymentResult.receiptUrl,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
