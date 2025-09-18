import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    if (!code || typeof orderTotal !== "number") {
      return NextResponse.json({ valid: false, error: "invalid_request" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id

    // Call the validate_coupon function
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_coupon_code: code,
      p_user_id: userId,
      p_order_total: orderTotal,
      p_user_type: "retail", // TODO: Get actual user type from profile
    })

    if (error) {
      console.error("Error validating coupon:", error)
      return NextResponse.json({ valid: false, error: "validation_error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in coupon validation:", error)
    return NextResponse.json({ valid: false, error: "server_error" }, { status: 500 })
  }
}
