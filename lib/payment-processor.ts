// Bank of America Merchant Services payment processing integration
export interface PaymentDetails {
  amount: number
  currency: string
  orderId: string
  customerId: string
  description: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  billingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  authCode?: string
  receiptUrl?: string
  responseCode?: string
  avsResult?: string
  cvvResult?: string
}

// Bank of America Merchant Services payment processor
export class BankOfAmericaPaymentProcessor {
  private apiKey: string
  private apiSecret: string
  private environment: "sandbox" | "production"
  private merchantId: string

  constructor() {
    this.apiKey = process.env.BOA_API_KEY || ""
    this.apiSecret = process.env.BOA_API_SECRET || ""
    this.environment = (process.env.BOA_ENVIRONMENT as "sandbox" | "production") || "sandbox"
    this.merchantId = process.env.BOA_MERCHANT_ID || ""

    if (!this.apiKey || !this.apiSecret || !this.merchantId) {
      console.warn(
        "Bank of America payment processor not fully configured. Please set BOA_API_KEY, BOA_API_SECRET, and BOA_MERCHANT_ID environment variables.",
      )
    }
  }

  async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      // Bank of America Merchant Services API integration
      const requestBody = {
        merchantId: this.merchantId,
        transactionType: "SALE",
        amount: Math.round(paymentDetails.amount * 100), // Convert to cents
        currency: paymentDetails.currency,
        orderId: paymentDetails.orderId,
        customerId: paymentDetails.customerId,
        description: paymentDetails.description,
        card: {
          number: paymentDetails.cardNumber,
          expiryMonth: paymentDetails.expiryMonth,
          expiryYear: paymentDetails.expiryYear,
          cvv: paymentDetails.cvv,
        },
        billingAddress: {
          firstName: paymentDetails.billingAddress.name.split(" ")[0],
          lastName: paymentDetails.billingAddress.name.split(" ").slice(1).join(" "),
          address1: paymentDetails.billingAddress.address,
          city: paymentDetails.billingAddress.city,
          state: paymentDetails.billingAddress.state,
          postalCode: paymentDetails.billingAddress.zipCode,
          country: paymentDetails.billingAddress.country,
        },
      }

      const response = await fetch(`${this.getApiUrl()}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAccessToken()}`,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (response.ok && (result.responseCode === "00" || result.status === "APPROVED")) {
        return {
          success: true,
          transactionId: result.transactionId,
          authCode: result.authorizationCode,
          receiptUrl: result.receiptUrl,
          responseCode: result.responseCode,
          avsResult: result.avsResult,
          cvvResult: result.cvvResult,
        }
      } else {
        return {
          success: false,
          error: result.responseMessage || result.message || "Payment processing failed",
          responseCode: result.responseCode,
        }
      }
    } catch (error) {
      console.error("Bank of America payment processing error:", error)
      return {
        success: false,
        error: "Payment system temporarily unavailable",
      }
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const requestBody = {
        merchantId: this.merchantId,
        transactionType: "REFUND",
        originalTransactionId: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
      }

      const response = await fetch(`${this.getApiUrl()}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAccessToken()}`,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (response.ok && (result.responseCode === "00" || result.status === "APPROVED")) {
        return {
          success: true,
          transactionId: result.transactionId,
          authCode: result.authorizationCode,
        }
      } else {
        return {
          success: false,
          error: result.responseMessage || result.message || "Refund processing failed",
        }
      }
    } catch (error) {
      console.error("Bank of America refund processing error:", error)
      return {
        success: false,
        error: "Refund system temporarily unavailable",
      }
    }
  }

  async voidPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const requestBody = {
        merchantId: this.merchantId,
        transactionType: "VOID",
        originalTransactionId: transactionId,
      }

      const response = await fetch(`${this.getApiUrl()}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAccessToken()}`,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (response.ok && (result.responseCode === "00" || result.status === "APPROVED")) {
        return {
          success: true,
          transactionId: result.transactionId,
        }
      } else {
        return {
          success: false,
          error: result.responseMessage || result.message || "Void processing failed",
        }
      }
    } catch (error) {
      console.error("Bank of America void processing error:", error)
      return {
        success: false,
        error: "Void system temporarily unavailable",
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.getApiUrl()}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      })

      const result = await response.json()
      return result.access_token
    } catch (error) {
      console.error("Error getting Bank of America access token:", error)
      throw new Error("Authentication failed")
    }
  }

  private getApiUrl(): string {
    // Bank of America Merchant Services API URLs
    return this.environment === "production"
      ? "https://api.merchantservices.bankofamerica.com/v1"
      : "https://sandbox-api.merchantservices.bankofamerica.com/v1"
  }

  // Utility method to validate card number using Luhn algorithm
  static validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\D/g, "")
    let sum = 0
    let isEven = false

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cleanNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Get card type from card number
  static getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "")

    if (/^4/.test(cleanNumber)) return "Visa"
    if (/^5[1-5]/.test(cleanNumber)) return "MasterCard"
    if (/^3[47]/.test(cleanNumber)) return "American Express"
    if (/^6(?:011|5)/.test(cleanNumber)) return "Discover"

    return "Unknown"
  }
}

// Export the main payment processor
export const PaymentProcessor = BankOfAmericaPaymentProcessor
