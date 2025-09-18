import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { ZohoService } from "@/lib/zoho-service"

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
    const { customerId, direction = "to_zoho" } = body

    if (direction === "to_zoho") {
      // Sync customer from website to Zoho
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      const zohoService = new ZohoService()
      const syncResult = await zohoService.syncCustomerToZoho({
        firstName: profile.full_name?.split(" ")[0] || "",
        lastName: profile.full_name?.split(" ").slice(1).join(" ") || "",
        email: profile.email,
        phone: profile.phone,
        company: profile.company,
        address: profile.address ? JSON.parse(profile.address) : undefined,
        customerType: profile.customer_type,
        creditLimit: profile.credit_limit,
        paymentTerms: profile.payment_terms,
        zohoId: profile.zoho_id,
      })

      if (syncResult.success) {
        // Update profile with Zoho ID
        await supabase
          .from("profiles")
          .update({
            zoho_id: syncResult.zohoId,
            last_zoho_sync: syncResult.syncedAt,
          })
          .eq("id", customerId)

        return NextResponse.json({
          success: true,
          zohoId: syncResult.zohoId,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: syncResult.error,
          },
          { status: 400 },
        )
      }
    } else if (direction === "from_zoho") {
      // Sync customer from Zoho to website
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("zoho_id")
        .eq("id", customerId)
        .single()

      if (profileError || !profile?.zoho_id) {
        return NextResponse.json({ error: "Customer or Zoho ID not found" }, { status: 404 })
      }

      const zohoService = new ZohoService()
      const zohoCustomer = await zohoService.getCustomerFromZoho(profile.zoho_id)

      if (zohoCustomer) {
        // Update local profile with Zoho data
        await supabase
          .from("profiles")
          .update({
            full_name: `${zohoCustomer.firstName} ${zohoCustomer.lastName}`,
            phone: zohoCustomer.phone,
            company: zohoCustomer.company,
            address: JSON.stringify(zohoCustomer.address),
            customer_type: zohoCustomer.customerType,
            credit_limit: zohoCustomer.creditLimit,
            payment_terms: zohoCustomer.paymentTerms,
            last_zoho_sync: zohoCustomer.lastSyncAt,
          })
          .eq("id", customerId)

        return NextResponse.json({
          success: true,
          customer: zohoCustomer,
        })
      } else {
        return NextResponse.json({ error: "Customer not found in Zoho" }, { status: 404 })
      }
    }

    return NextResponse.json({ error: "Invalid sync direction" }, { status: 400 })
  } catch (error) {
    console.error("Zoho sync error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
