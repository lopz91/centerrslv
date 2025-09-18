import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { zohoBooksService } from "@/lib/zoho-books-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, data } = body

    // Verify webhook authenticity (you should implement proper verification)
    const webhookSecret = process.env.ZOHO_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    switch (event_type) {
      case "item.created":
      case "item.updated":
        // Sync the updated product
        if (data.item_id) {
          await zohoBooksService.syncSingleProduct(data.item_id)
        }
        break

      case "purchaseorder.status_changed":
        // Update purchase order status in database
        const supabase = createServerClient()
        await supabase
          .from("purchase_orders")
          .update({
            status: data.status,
            zoho_updated_at: new Date().toISOString(),
          })
          .eq("zoho_po_id", data.purchaseorder_id)
        break

      case "invoice.created":
      case "invoice.updated":
        // Handle invoice updates
        console.log("Invoice webhook received:", data)
        break

      default:
        console.log("Unhandled webhook event:", event_type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Zoho webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
