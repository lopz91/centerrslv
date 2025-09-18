import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { tier } = await request.json()

    if (!["bronze", "silver", "gold", "platinum"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Update contractor profile with new tier and featured status
    const { data, error } = await supabase
      .from("contractor_profiles")
      .update({
        spend_tier: tier,
        is_featured: true,
        updated_at: new Date().toISOString(),
      })
      .eq("customer_id", customer.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating contractor profile:", error)
      return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 })
    }

    // Here you would integrate with payment processing
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      profile: data,
      message: "Upgrade successful",
    })
  } catch (error) {
    console.error("Error in upgrade route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
