import { createClient } from "@/lib/supabase/server"
import { zohoBooksAPI } from "@/lib/zoho-books"

export interface ZohoInvoice {
  customer_id: string
  date: string
  due_date: string
  reference_number: string
  line_items: Array<{
    name: string
    description?: string
    rate: number
    quantity: number
    unit?: string
  }>
  notes?: string
  terms?: string
  shipping_address?: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface ZohoShippingTicket {
  customer_id: string
  date: string
  reference_number: string
  line_items: Array<{
    name: string
    quantity: number
    unit?: string
  }>
  shipping_address: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  notes?: string
}

export async function createInvoiceFromOrder(orderId: string): Promise<{
  success: boolean
  invoiceId?: string
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Get order details with items and user profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      throw new Error("Order not found")
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        products!inner(*)
      `)
      .eq("order_id", orderId)

    if (itemsError || !orderItems) {
      throw new Error("Order items not found")
    }

    // Create customer if not exists
    const customerName = order.profiles.company_name || `${order.profiles.first_name} ${order.profiles.last_name}`

    // Check if customer exists
    const customers = await zohoBooksAPI.getCustomers()
    let customerId = customers.contacts?.find(
      (c: any) => c.contact_name === customerName || c.email === order.profiles.email,
    )?.contact_id

    if (!customerId) {
      // Create new customer
      const newCustomer = await zohoBooksAPI.createCustomer({
        customer_name: customerName,
        company_name: order.profiles.company_name || undefined,
        email: order.profiles.email,
        phone: order.profiles.phone || undefined,
        billing_address: order.delivery_address
          ? {
              address: order.delivery_address.address,
              city: order.delivery_address.city,
              state: order.delivery_address.state,
              zip: order.delivery_address.zip,
              country: "US",
            }
          : undefined,
      })
      customerId = newCustomer.contact?.contact_id
    }

    if (!customerId) {
      throw new Error("Failed to create or find customer")
    }

    // Prepare line items
    const lineItems = orderItems.map((item: any) => ({
      name: item.products.name_en,
      description: item.products.description_en || undefined,
      rate: item.unit_price,
      quantity: item.quantity,
      unit: item.products.unit || "pcs",
    }))

    // Add delivery fee as separate line item if applicable
    if (order.delivery_fee > 0) {
      lineItems.push({
        name: "Delivery Fee",
        description: "Delivery and handling charges",
        rate: order.delivery_fee,
        quantity: 1,
        unit: "service",
      })
    }

    // Create invoice
    const invoice: ZohoInvoice = {
      customer_id: customerId,
      date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      reference_number: order.order_number,
      line_items: lineItems,
      notes: order.notes || `Invoice for order #${order.order_number}`,
      terms: "Net 30",
      shipping_address: order.delivery_address
        ? {
            address: order.delivery_address.address,
            city: order.delivery_address.city,
            state: order.delivery_address.state,
            zip: order.delivery_address.zip,
            country: "US",
          }
        : undefined,
    }

    const result = await zohoBooksAPI.createInvoice(invoice)
    const invoiceId = result.invoice?.invoice_id

    if (!invoiceId) {
      throw new Error("Failed to create invoice in Zoho Books")
    }

    // Update order with invoice reference
    await supabase
      .from("orders")
      .update({
        zoho_invoice_id: invoiceId,
        zoho_invoice_number: result.invoice?.invoice_number,
      })
      .eq("id", orderId)

    return {
      success: true,
      invoiceId,
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function createShippingTicketFromOrder(orderId: string): Promise<{
  success: boolean
  shippingTicketId?: string
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Get order details with items and user profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      throw new Error("Order not found")
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        products!inner(*)
      `)
      .eq("order_id", orderId)

    if (itemsError || !orderItems) {
      throw new Error("Order items not found")
    }

    // Ensure shipping address is populated
    if (!order.delivery_address) {
      throw new Error("Shipping address is required for shipping ticket")
    }

    // Get customer ID (should exist from invoice creation)
    const customerName = order.profiles.company_name || `${order.profiles.first_name} ${order.profiles.last_name}`
    const customers = await zohoBooksAPI.getCustomers()
    const customerId = customers.contacts?.find(
      (c: any) => c.contact_name === customerName || c.email === order.profiles.email,
    )?.contact_id

    if (!customerId) {
      throw new Error("Customer not found in Zoho Books")
    }

    // Prepare line items for shipping
    const lineItems = orderItems.map((item: any) => ({
      name: item.products.name_en,
      quantity: item.quantity,
      unit: item.products.unit || "pcs",
    }))

    // Create shipping ticket (using Zoho's delivery challan or similar document)
    const shippingTicket: ZohoShippingTicket = {
      customer_id: customerId,
      date: new Date().toISOString().split("T")[0],
      reference_number: `SHIP-${order.order_number}`,
      line_items: lineItems,
      shipping_address: {
        address: order.delivery_address.address,
        city: order.delivery_address.city,
        state: order.delivery_address.state,
        zip: order.delivery_address.zip,
        country: "US",
      },
      notes: `Shipping ticket for order #${order.order_number}. Delivery to: ${order.delivery_address.firstName} ${order.delivery_address.lastName}, Phone: ${order.delivery_address.phone}`,
    }

    const result = await zohoBooksAPI.createDeliveryChallan(shippingTicket)
    const shippingTicketId = result.deliverychallan?.deliverychallan_id

    if (!shippingTicketId) {
      throw new Error("Failed to create shipping ticket in Zoho Books")
    }

    // Update order with shipping ticket reference
    await supabase
      .from("orders")
      .update({
        zoho_shipping_ticket_id: shippingTicketId,
        zoho_shipping_ticket_number: result.deliverychallan?.deliverychallan_number,
      })
      .eq("id", orderId)

    return {
      success: true,
      shippingTicketId,
    }
  } catch (error) {
    console.error("Error creating shipping ticket:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function processOrderDocuments(
  orderId: string,
  orderStatus: string,
  paymentStatus: string,
): Promise<{
  success: boolean
  documentsCreated: string[]
  errors: string[]
}> {
  const documentsCreated: string[] = []
  const errors: string[] = []

  try {
    // Create invoice when order is confirmed and paid
    if (paymentStatus === "paid" && (orderStatus === "confirmed" || orderStatus === "processing")) {
      const invoiceResult = await createInvoiceFromOrder(orderId)
      if (invoiceResult.success) {
        documentsCreated.push("invoice")
      } else {
        errors.push(`Invoice creation failed: ${invoiceResult.error}`)
      }
    }

    // Create shipping ticket when order is being processed
    if (orderStatus === "processing" || orderStatus === "shipped") {
      const shippingResult = await createShippingTicketFromOrder(orderId)
      if (shippingResult.success) {
        documentsCreated.push("shipping_ticket")
      } else {
        errors.push(`Shipping ticket creation failed: ${shippingResult.error}`)
      }
    }

    // Create purchase order when order is confirmed (already exists in purchase-order-utils.ts)
    if (orderStatus === "confirmed") {
      const { createPurchaseOrderFromOrder } = await import("@/lib/purchase-order-utils")
      const poResult = await createPurchaseOrderFromOrder(orderId)
      if (poResult.success) {
        documentsCreated.push("purchase_order")
      } else {
        errors.push(`Purchase order creation failed: ${poResult.error}`)
      }
    }

    return {
      success: errors.length === 0,
      documentsCreated,
      errors,
    }
  } catch (error) {
    console.error("Error processing order documents:", error)
    return {
      success: false,
      documentsCreated,
      errors: [error instanceof Error ? error.message : "Unknown error occurred"],
    }
  }
}
