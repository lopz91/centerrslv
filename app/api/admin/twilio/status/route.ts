import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single()

    if (profile?.account_type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    const connected = !!(accountSid && authToken && phoneNumber)

    return NextResponse.json({
      connected,
      accountSid: connected ? accountSid?.substring(0, 8) + "..." : null,
      phoneNumber: connected ? phoneNumber : null,
    })
  } catch (error) {
    console.error("Error checking Twilio status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
