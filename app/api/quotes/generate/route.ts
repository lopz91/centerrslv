import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, project, estimate, services, createdAt } = body

    const supabase = createClient()

    // Insert quote into database
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        project_type: project.type,
        project_area: project.area,
        project_perimeter: project.perimeter,
        project_notes: project.notes,
        material_cost: estimate.materialCost,
        labor_cost: estimate.laborCost,
        services_cost: estimate.servicesCost,
        subtotal: estimate.subtotal,
        tax_amount: estimate.tax,
        total_amount: estimate.total,
        additional_services: services,
        status: "draft",
        created_at: createdAt,
      })
      .select()
      .single()

    if (quoteError) {
      throw quoteError
    }

    // Sync to Zoho CRM if configured
    try {
      const crmResponse = await fetch("/api/zoho/sync-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          quote: quote,
          project,
        }),
      })

      if (!crmResponse.ok) {
        console.warn("Failed to sync to Zoho CRM:", await crmResponse.text())
      }
    } catch (crmError) {
      console.warn("CRM sync error:", crmError)
    }

    return NextResponse.json({
      success: true,
      quote,
      message: "Quote generated successfully",
    })
  } catch (error) {
    console.error("Quote generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
