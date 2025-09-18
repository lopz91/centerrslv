import { type NextRequest, NextResponse } from "next/server"
import { createCustomerProfile, syncCustomerToZoho } from "@/lib/customer-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, email, first_name, last_name, phone, company_name, account_type } = body

    // Create customer profile
    const customer = await createCustomerProfile({
      user_id,
      email,
      first_name,
      last_name,
      phone,
      company_name,
      account_type,
    })

    // Sync to Zoho Books in background
    try {
      await syncCustomerToZoho(customer.id)
    } catch (zohoError) {
      console.error("Failed to sync customer to Zoho:", zohoError)
      // Don't fail the request if Zoho sync fails
    }

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer profile" }, { status: 500 })
  }
}
