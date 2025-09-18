import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { SMSService } from "@/lib/sms-service"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    // Send test SMS
    const smsService = new SMSService()
    const result = await smsService.sendSMS({
      to,
      message,
    })

    if (result.success) {
      // Log the test SMS
      await supabase.from("order_notifications").insert({
        notification_type: "sms",
        message,
        phone_number: to,
        status: "sent",
        message_id: result.messageId,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error sending test SMS:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
