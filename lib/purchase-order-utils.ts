import { createClient } from "@/lib/supabase/server"
import { zohoBooksAPI, type ZohoPurchaseOrder } from "@/lib/zoho-books"

export async function createPurchaseOrderFromOrder(orderId: string): Promise<{
  success: boolean
  purchaseOrderId?: string
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

    // Create vendor if not exists (using company info or customer info)
    const vendorName = order.profiles.company_name || `${order.profiles.first_name} ${order.profiles.last_name}`

    // Check if vendor exists
    const vendors = await zohoBooksAPI.getVendors()
    let vendorId = vendors.contacts?.find(
      (v: any) => v.contact_name === vendorName || v.email === order.profiles.email,
    )?.contact_id

    if (!vendorId) {
      // Create new vendor
      const newVendor = await zohoBooksAPI.createVendor({
        vendor_name: vendorName,
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
      vendorId = newVendor.contact?.contact_id
    }

    if (!vendorId) {
      throw new Error("Failed to create or find vendor")
    }

    // Prepare line items
    const lineItems = orderItems.map((item: any) => ({
      name: item.products.name_en,
      description: item.products.description_en || undefined,
      rate: item.unit_price,
      quantity: item.quantity,
      unit: item.products.unit || "pcs",
    }))

    // Create purchase order
    const purchaseOrder: ZohoPurchaseOrder = {
      vendor_id: vendorId,
      date: new Date().toISOString().split("T")[0],
      delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      reference_number: order.order_number,
      line_items: lineItems,
      notes: order.notes || `Purchase order for customer order #${order.order_number}`,
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

    const result = await zohoBooksAPI.createPurchaseOrder(purchaseOrder)
    const purchaseOrderId = result.purchaseorder?.purchaseorder_id

    if (!purchaseOrderId) {
      throw new Error("Failed to create purchase order in Zoho Books")
    }

    // Update order with purchase order reference
    await supabase
      .from("orders")
      .update({
        zoho_purchase_order_id: purchaseOrderId,
        zoho_purchase_order_number: result.purchaseorder?.purchaseorder_number,
      })
      .eq("id", orderId)

    return {
      success: true,
      purchaseOrderId,
    }
  } catch (error) {
    console.error("Error creating purchase order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function syncPurchaseOrderStatus(orderId: string): Promise<{
  success: boolean
  status?: string
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Get order with Zoho PO ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("zoho_purchase_order_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order?.zoho_purchase_order_id) {
      throw new Error("Order or purchase order ID not found")
    }

    // Get PO status from Zoho
    const poData = await zohoBooksAPI.getPurchaseOrder(order.zoho_purchase_order_id)
    const poStatus = poData.purchaseorder?.status

    if (!poStatus) {
      throw new Error("Purchase order status not found")
    }

    // Map Zoho status to our order status
    let orderStatus = "pending"
    switch (poStatus.toLowerCase()) {
      case "draft":
        orderStatus = "pending"
        break
      case "open":
      case "issued":
        orderStatus = "confirmed"
        break
      case "partially_received":
        orderStatus = "processing"
        break
      case "received":
        orderStatus = "shipped"
        break
      case "closed":
        orderStatus = "delivered"
        break
      case "cancelled":
        orderStatus = "cancelled"
        break
    }

    // Update order status
    await supabase.from("orders").update({ status: orderStatus }).eq("id", orderId)

    return {
      success: true,
      status: orderStatus,
    }
  } catch (error) {
    console.error("Error syncing purchase order status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function listPurchaseOrders(filters?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  purchaseOrders?: any[]
  error?: string
}> {
  try {
    const result = await zohoBooksAPI.listPurchaseOrders({
      status: filters?.status,
      page: filters?.page || 1,
      per_page: filters?.limit || 20,
    })

    return {
      success: true,
      purchaseOrders: result.purchaseorders || [],
    }
  } catch (error) {
    console.error("Error listing purchase orders:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
