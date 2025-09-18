// Zoho CRM integration service for two-way customer synchronization
export interface ZohoCustomer {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  customerType?: "residential" | "commercial" | "contractor"
  creditLimit?: number
  paymentTerms?: string
  zohoId?: string
  lastSyncAt?: string
}

export interface ZohoSyncResult {
  success: boolean
  zohoId?: string
  error?: string
  syncedAt?: string
}

export class ZohoService {
  private clientId: string
  private clientSecret: string
  private refreshToken: string
  private accessToken: string | null = null
  private tokenExpiresAt = 0

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID || ""
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET || ""
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN || ""
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        this.accessToken = data.access_token
        this.tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000 // 1 minute buffer
        return this.accessToken
      } else {
        throw new Error(`Token refresh failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Zoho token refresh error:", error)
      throw error
    }
  }

  async syncCustomerToZoho(customer: ZohoCustomer): Promise<ZohoSyncResult> {
    try {
      const accessToken = await this.getAccessToken()

      const zohoData = {
        data: [
          {
            First_Name: customer.firstName,
            Last_Name: customer.lastName,
            Email: customer.email,
            Phone: customer.phone,
            Account_Name: customer.company || `${customer.firstName} ${customer.lastName}`,
            Billing_Street: customer.address?.street,
            Billing_City: customer.address?.city,
            Billing_State: customer.address?.state,
            Billing_Code: customer.address?.zipCode,
            Billing_Country: customer.address?.country || "USA",
            Customer_Type: customer.customerType,
            Credit_Limit: customer.creditLimit,
            Payment_Terms: customer.paymentTerms,
            Lead_Source: "Website",
          },
        ],
      }

      const url = customer.zohoId
        ? `https://www.zohoapis.com/crm/v2/Contacts/${customer.zohoId}`
        : "https://www.zohoapis.com/crm/v2/Contacts"

      const method = customer.zohoId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(zohoData),
      })

      const result = await response.json()

      if (response.ok && result.data && result.data[0].status === "success") {
        return {
          success: true,
          zohoId: result.data[0].details.id,
          syncedAt: new Date().toISOString(),
        }
      } else {
        return {
          success: false,
          error: result.data?.[0]?.message || "Zoho sync failed",
        }
      }
    } catch (error) {
      console.error("Zoho sync error:", error)
      return {
        success: false,
        error: "Zoho service temporarily unavailable",
      }
    }
  }

  async getCustomerFromZoho(zohoId: string): Promise<ZohoCustomer | null> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://www.zohoapis.com/crm/v2/Contacts/${zohoId}`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.data && result.data[0]) {
        const contact = result.data[0]
        return {
          zohoId: contact.id,
          firstName: contact.First_Name || "",
          lastName: contact.Last_Name || "",
          email: contact.Email || "",
          phone: contact.Phone,
          company: contact.Account_Name,
          address: {
            street: contact.Billing_Street || "",
            city: contact.Billing_City || "",
            state: contact.Billing_State || "",
            zipCode: contact.Billing_Code || "",
            country: contact.Billing_Country || "USA",
          },
          customerType: contact.Customer_Type,
          creditLimit: contact.Credit_Limit,
          paymentTerms: contact.Payment_Terms,
          lastSyncAt: new Date().toISOString(),
        }
      }

      return null
    } catch (error) {
      console.error("Zoho fetch error:", error)
      return null
    }
  }

  async searchCustomersByEmail(email: string): Promise<ZohoCustomer[]> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(
        `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=(Email:equals:${encodeURIComponent(email)})`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        },
      )

      const result = await response.json()

      if (response.ok && result.data) {
        return result.data.map((contact: any) => ({
          zohoId: contact.id,
          firstName: contact.First_Name || "",
          lastName: contact.Last_Name || "",
          email: contact.Email || "",
          phone: contact.Phone,
          company: contact.Account_Name,
          address: {
            street: contact.Billing_Street || "",
            city: contact.Billing_City || "",
            state: contact.Billing_State || "",
            zipCode: contact.Billing_Code || "",
            country: contact.Billing_Country || "USA",
          },
          customerType: contact.Customer_Type,
          creditLimit: contact.Credit_Limit,
          paymentTerms: contact.Payment_Terms,
          lastSyncAt: new Date().toISOString(),
        }))
      }

      return []
    } catch (error) {
      console.error("Zoho search error:", error)
      return []
    }
  }
}
