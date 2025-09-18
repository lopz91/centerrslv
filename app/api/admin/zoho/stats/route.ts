import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get total products count
    const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

    // Get products synced today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: syncedToday } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", today.toISOString())

    // Get total customers count
    const { count: totalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true })

    // Get customers linked to Zoho CRM
    const { count: linkedCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .not("zoho_crm_id", "is", null)

    // Get pending orders count
    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "confirmed", "processing"])

    // Get last sync time from products table
    const { data: lastSyncData } = await supabase
      .from("products")
      .select("updated_at")
      .not("zoho_item_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)

    const lastSyncTime = lastSyncData?.[0]?.updated_at || null

    const stats = {
      totalProducts: totalProducts || 0,
      syncedToday: syncedToday || 0,
      totalCustomers: totalCustomers || 0,
      linkedCustomers: linkedCustomers || 0,
      pendingOrders: pendingOrders || 0,
      lastSyncTime,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching Zoho stats:", error)
    return NextResponse.json(
      {
        totalProducts: 0,
        syncedToday: 0,
        totalCustomers: 0,
        linkedCustomers: 0,
        pendingOrders: 0,
        lastSyncTime: null,
      },
      { status: 500 },
    )
  }
}
