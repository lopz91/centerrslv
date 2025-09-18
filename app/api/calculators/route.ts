import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const supabase = createServerClient()

    let query = supabase
      .from("product_calculators")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data: calculators, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch calculators" }, { status: 500 })
    }

    // Parse variables JSON
    const parsedCalculators = calculators.map((calc) => ({
      ...calc,
      variables: typeof calc.variables === "string" ? JSON.parse(calc.variables) : calc.variables,
    }))

    return NextResponse.json({ calculators: parsedCalculators })
  } catch (error) {
    console.error("Calculator fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
