import { type NextRequest, NextResponse } from "next/server"
import { zohoBooksService } from "@/lib/zoho-books-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId } = body

    let result
    if (itemId) {
      // Sync single product
      result = await zohoBooksService.syncSingleProduct(itemId)
    } else {
      // Sync all products
      result = await zohoBooksService.syncProductsToDatabase()
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: itemId
          ? `Product ${result.product} synced successfully`
          : `${result.syncedCount} products synced successfully`,
        data: result,
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
    console.error("Zoho product sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to trigger manual sync
export async function GET() {
  try {
    const result = await zohoBooksService.syncProductsToDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${result.syncedCount} products synced successfully`,
        data: result,
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
    console.error("Zoho product sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
