interface ZohoConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  organizationId: string
  baseUrl: string
}

interface ZohoTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface ZohoPurchaseOrder {
  purchaseorder_id?: string
  purchaseorder_number?: string
  vendor_id: string
  date: string
  delivery_date?: string
  reference_number?: string
  status?: string
  line_items: Array<{
    item_id?: string
    name: string
    description?: string
    rate: number
    quantity: number
    unit?: string
    tax_id?: string
  }>
  notes?: string
  terms?: string
  billing_address?: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  shipping_address?: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface ZohoInvoice {
  invoice_id?: string
  invoice_number?: string
  customer_id: string
  date: string
  due_date: string
  reference_number?: string
  status?: string
  line_items: Array<{
    item_id?: string
    name: string
    description?: string
    rate: number
    quantity: number
    unit?: string
    tax_id?: string
  }>
  notes?: string
  terms?: string
  shipping_address?: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface ZohoCustomer {
  contact_id?: string
  customer_name: string
  company_name?: string
  email?: string
  phone?: string
  billing_address?: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface ZohoDeliveryChallan {
  deliverychallan_id?: string
  deliverychallan_number?: string
  customer_id: string
  date: string
  reference_number?: string
  line_items: Array<{
    item_id?: string
    name: string
    quantity: number
    unit?: string
  }>
  shipping_address: {
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  notes?: string
}

class ZohoBooksAPI {
  private config: ZohoConfig
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || "",
      clientSecret: process.env.ZOHO_CLIENT_SECRET || "",
      refreshToken: process.env.ZOHO_REFRESH_TOKEN || "",
      organizationId: process.env.ZOHO_ORGANIZATION_ID || "",
      baseUrl: "https://www.zohoapis.com/books/v3",
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data: ZohoTokenResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000 // Refresh 1 minute early

    return this.accessToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    const url = `${this.config.baseUrl}${endpoint}?organization_id=${this.config.organizationId}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Zoho API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async createPurchaseOrder(purchaseOrder: ZohoPurchaseOrder): Promise<any> {
    return this.makeRequest("/purchaseorders", {
      method: "POST",
      body: JSON.stringify(purchaseOrder),
    })
  }

  async getPurchaseOrder(purchaseOrderId: string): Promise<any> {
    return this.makeRequest(`/purchaseorders/${purchaseOrderId}`)
  }

  async updatePurchaseOrder(purchaseOrderId: string, purchaseOrder: Partial<ZohoPurchaseOrder>): Promise<any> {
    return this.makeRequest(`/purchaseorders/${purchaseOrderId}`, {
      method: "PUT",
      body: JSON.stringify(purchaseOrder),
    })
  }

  async listPurchaseOrders(params?: {
    status?: string
    vendor_id?: string
    date?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/purchaseorders${queryParams.toString() ? `&${queryParams.toString()}` : ""}`
    return this.makeRequest(endpoint)
  }

  async createVendor(vendor: {
    vendor_name: string
    company_name?: string
    email?: string
    phone?: string
    billing_address?: {
      address: string
      city: string
      state: string
      zip: string
      country: string
    }
  }): Promise<any> {
    return this.makeRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({
        ...vendor,
        contact_type: "vendor",
      }),
    })
  }

  async getVendors(): Promise<any> {
    return this.makeRequest("/contacts?contact_type=vendor")
  }

  async createCustomer(customer: ZohoCustomer): Promise<any> {
    return this.makeRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({
        ...customer,
        contact_type: "customer",
      }),
    })
  }

  async getCustomers(): Promise<any> {
    return this.makeRequest("/contacts?contact_type=customer")
  }

  async getCustomer(customerId: string): Promise<any> {
    return this.makeRequest(`/contacts/${customerId}`)
  }

  async createInvoice(invoice: ZohoInvoice): Promise<any> {
    return this.makeRequest("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    })
  }

  async getInvoice(invoiceId: string): Promise<any> {
    return this.makeRequest(`/invoices/${invoiceId}`)
  }

  async updateInvoice(invoiceId: string, invoice: Partial<ZohoInvoice>): Promise<any> {
    return this.makeRequest(`/invoices/${invoiceId}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    })
  }

  async listInvoices(params?: {
    status?: string
    customer_id?: string
    date?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/invoices${queryParams.toString() ? `&${queryParams.toString()}` : ""}`
    return this.makeRequest(endpoint)
  }

  async createDeliveryChallan(deliveryChallan: ZohoDeliveryChallan): Promise<any> {
    return this.makeRequest("/deliverychallan", {
      method: "POST",
      body: JSON.stringify(deliveryChallan),
    })
  }

  async getDeliveryChallan(deliveryChallanId: string): Promise<any> {
    return this.makeRequest(`/deliverychallan/${deliveryChallanId}`)
  }

  async updateDeliveryChallan(deliveryChallanId: string, deliveryChallan: Partial<ZohoDeliveryChallan>): Promise<any> {
    return this.makeRequest(`/deliverychallan/${deliveryChallanId}`, {
      method: "PUT",
      body: JSON.stringify(deliveryChallan),
    })
  }

  async listDeliveryChallans(params?: {
    customer_id?: string
    date?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/deliverychallan${queryParams.toString() ? `&${queryParams.toString()}` : ""}`
    return this.makeRequest(endpoint)
  }

  async createItem(item: {
    name: string
    description?: string
    rate: number
    unit?: string
    sku?: string
    category_id?: string
  }): Promise<any> {
    return this.makeRequest("/items", {
      method: "POST",
      body: JSON.stringify({
        ...item,
        item_type: "inventory",
      }),
    })
  }

  async getItems(): Promise<any> {
    return this.makeRequest("/items")
  }
}

export const zohoBooksAPI = new ZohoBooksAPI()
export type { ZohoPurchaseOrder, ZohoInvoice, ZohoCustomer, ZohoDeliveryChallan }
