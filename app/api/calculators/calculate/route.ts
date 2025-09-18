import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { calculatorId, inputValues } = body

    // Get calculator configuration
    const { data: calculator, error: calcError } = await supabase
      .from("product_calculators")
      .select("*")
      .eq("id", calculatorId)
      .eq("is_active", true)
      .single()

    if (calcError || !calculator) {
      return NextResponse.json({ error: "Calculator not found" }, { status: 404 })
    }

    // Parse variables
    const variables = typeof calculator.variables === "string" ? JSON.parse(calculator.variables) : calculator.variables

    // Validate input values
    for (const variable of variables) {
      if (!(variable.name in inputValues)) {
        return NextResponse.json({ error: `Missing value for ${variable.label}` }, { status: 400 })
      }
    }

    // Calculate result using the formula
    let result: number
    try {
      // Replace variable names in formula with actual values
      let formula = calculator.formula
      for (const [varName, value] of Object.entries(inputValues)) {
        const regex = new RegExp(`\\{${varName}\\}`, "g")
        formula = formula.replace(regex, String(value))
      }

      // Evaluate the formula safely (basic math operations only)
      result = evaluateFormula(formula)
    } catch (error) {
      console.error("Formula evaluation error:", error)
      return NextResponse.json({ error: "Invalid formula or calculation error" }, { status: 400 })
    }

    // Log the calculation for analytics
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from("calculator_usage_log").insert({
      calculator_id: calculatorId,
      user_id: user?.id || null,
      input_values: inputValues,
      calculated_result: { result, unit: calculator.type === "tonnage" ? "tons" : "sq_ft" },
      session_id: request.headers.get("x-session-id"),
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    })

    return NextResponse.json({
      success: true,
      result,
      unit: calculator.type === "tonnage" ? "tons" : "sq_ft",
      calculatorName: calculator.name,
    })
  } catch (error) {
    console.error("Calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Safe formula evaluation function (basic math operations only)
function evaluateFormula(formula: string): number {
  // Remove any non-math characters for security
  const sanitized = formula.replace(/[^0-9+\-*/.() ]/g, "")

  // Basic validation
  if (sanitized !== formula) {
    throw new Error("Invalid characters in formula")
  }

  // Evaluate using Function constructor (safer than eval for math expressions)
  try {
    const result = new Function(`"use strict"; return (${sanitized})`)()
    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Formula did not return a valid number")
    }
    return result
  } catch (error) {
    throw new Error("Formula evaluation failed")
  }
}
