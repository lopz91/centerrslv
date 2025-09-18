// Zoho Books API integration for product synchronization
export interface ZohoProduct {
  item_id: string
  name: string
  description?: string
  rate: number
  unit: string
  category_name?: string
  sku?: string
  status: "active" | "inactive"
  item_type: "inventory" | "service" | "non_inventory"
  stock_on_hand?: number
  reorder_level?: number
  initial_stock?: number
  vendor_id?: string
  vendor_name?: string
  purchase_rate?: number
  purchase_account_id?: string
  inventory_account_id?: string
  sales_account_id?: string
  purchase_description?: string
  sales_description?: string
  preferred_vendor?: string
  item_tax_preferences?: any[]
  custom_fields?: any[]
  documents?: any[]
  created_time: string
  last_modified_time: string
}

export interface ZohoProductsResponse {
  code: number
  message: string
  items: ZohoProduct[]
  page_context: {
    page: number
    per_page: number
    has_more_page: boolean
    report_name: string
    sort_column: string
    sort_order: string
  }
}

class ZohoBooksService {
  private baseUrl: string
  private organizationId: string
  private accessToken: string

  constructor() {
    this.baseUrl = "https://www.zohoapis.com/books/v3"
    this.organizationId = process.env.ZOHO_ORGANIZATION_ID || ""
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN || ""
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Zoho-oauthtoken ${this.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Zoho Books API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getAllProducts(page = 1, perPage = 200): Promise<ZohoProductsResponse> {
    const params = new URLSearchParams({
      organization_id: this.organizationId,
      page: page.toString(),
      per_page: perPage.toString(),
    })

    return this.makeRequest(`/items?${params}`)
  }

  async getProduct(itemId: string): Promise<{ item: ZohoProduct }> {
    const params = new URLSearchParams({
      organization_id: this.organizationId,
    })

    return this.makeRequest(`/items/${itemId}?${params}`)
  }

  async syncProductsToDatabase() {
    try {
      let page = 1
      let hasMorePages = true
      const syncedProducts = []

      while (hasMorePages) {
        const response = await this.getAllProducts(page)

        for (const zohoProduct of response.items) {
          // Convert Zoho product to our database format
          const productData = {
            zoho_item_id: zohoProduct.item_id,
            name: zohoProduct.name,
            description: zohoProduct.description || zohoProduct.sales_description || "",
            price: zohoProduct.rate,
            unit: zohoProduct.unit,
            category: zohoProduct.category_name || "General",
            sku: zohoProduct.sku || "",
            status: zohoProduct.status,
            item_type: zohoProduct.item_type,
            stock_quantity: zohoProduct.stock_on_hand || 0,
            reorder_level: zohoProduct.reorder_level || 0,
            vendor_name: zohoProduct.vendor_name || "",
            purchase_rate: zohoProduct.purchase_rate || 0,
            last_synced: new Date().toISOString(),
            zoho_created_time: zohoProduct.created_time,
            zoho_modified_time: zohoProduct.last_modified_time,
          }

          // Insert or update product in database
          const { createClient } = await import("./supabase/server")
          const supabase = createClient()

          const { error } = await supabase.from("products").upsert(productData, {
            onConflict: "zoho_item_id",
            ignoreDuplicates: false,
          })

          if (error) {
            console.error("Error syncing product:", zohoProduct.name, error)
          } else {
            syncedProducts.push(zohoProduct.name)
          }
        }

        hasMorePages = response.page_context.has_more_page
        page++
      }

      return {
        success: true,
        syncedCount: syncedProducts.length,
        syncedProducts,
      }
    } catch (error) {
      console.error("Error syncing products from Zoho Books:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async syncSingleProduct(itemId: string) {
    try {
      const response = await this.getProduct(itemId)
      const zohoProduct = response.item

      const productData = {
        zoho_item_id: zohoProduct.item_id,
        name: zohoProduct.name,
        description: zohoProduct.description || zohoProduct.sales_description || "",
        price: zohoProduct.rate,
        unit: zohoProduct.unit,
        category: zohoProduct.category_name || "General",
        sku: zohoProduct.sku || "",
        status: zohoProduct.status,
        item_type: zohoProduct.item_type,
        stock_quantity: zohoProduct.stock_on_hand || 0,
        reorder_level: zohoProduct.reorder_level || 0,
        vendor_name: zohoProduct.vendor_name || "",
        purchase_rate: zohoProduct.purchase_rate || 0,
        last_synced: new Date().toISOString(),
        zoho_created_time: zohoProduct.created_time,
        zoho_modified_time: zohoProduct.last_modified_time,
      }

      const { createClient } = await import("./supabase/server")
      const supabase = createClient()

      const { error } = await supabase.from("products").upsert(productData, {
        onConflict: "zoho_item_id",
        ignoreDuplicates: false,
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        product: zohoProduct.name,
      }
    } catch (error) {
      console.error("Error syncing single product:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const zohoBooksService = new ZohoBooksService()
