import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          company_name,
          address,
          city,
          state,
          zip_code,
          zoho_crm_id
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Create invoice data for Zoho Books
    const invoiceData = {
      customer_id: order.customers.zoho_crm_id,
      invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      line_items: [
        {
          item_id: "landscaping-services", // This should map to actual Zoho item IDs
          name: `Landscaping Order #${order.order_number}`,
          description: order.notes || "Landscaping materials and services",
          rate: order.total_amount,
          quantity: 1,
        },
      ],
      notes: `Generated from website order #${order.order_number}`,
      terms: "Payment due within 30 days",
      custom_fields: [
        {
          customfield_id: "website_order_id",
          value: order.id,
        },
      ],
    }

    // Here you would make the actual API call to Zoho Books
    // For now, we'll simulate the response
    const mockZohoResponse = {
      invoice: {
        invoice_id: `zoho_inv_${Date.now()}`,
        invoice_number: invoiceData.invoice_number,
        status: "draft",
        total: order.total_amount,
      },
    }

    // Update order with Zoho invoice information
    await supabase
      .from("orders")
      .update({
        zoho_books_id: mockZohoResponse.invoice.invoice_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    return NextResponse.json({
      success: true,
      invoiceNumber: mockZohoResponse.invoice.invoice_number,
      invoiceId: mockZohoResponse.invoice.invoice_id,
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to generate invoice" }, { status: 500 })
  }
}
