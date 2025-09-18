// SMS service for order updates using Twilio
export interface SMSMessage {
  to: string
  message: string
  orderId?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export class SMSService {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ""
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ""
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ""
  }

  async sendSMS(smsMessage: SMSMessage): Promise<SMSResult> {
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: smsMessage.to,
          Body: smsMessage.message,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: result.sid,
        }
      } else {
        return {
          success: false,
          error: result.message || "SMS sending failed",
        }
      }
    } catch (error) {
      console.error("SMS sending error:", error)
      return {
        success: false,
        error: "SMS service temporarily unavailable",
      }
    }
  }

  // Pre-defined message templates for different order statuses
  generateOrderStatusMessage(orderStatus: string, orderId: string, customerName: string): string {
    const messages = {
      confirmed: `Hi ${customerName}! Your Landscape Center order #${orderId} has been confirmed. We'll notify you when it's ready for pickup/delivery.`,
      processing: `${customerName}, your order #${orderId} is being prepared. Estimated completion: 2-3 business days.`,
      ready: `Great news ${customerName}! Your order #${orderId} is ready for pickup at Landscape Center. Please bring your order confirmation.`,
      shipped: `${customerName}, your order #${orderId} has been shipped and is on its way. Track your delivery for updates.`,
      delivered: `Your order #${orderId} has been delivered! Thank you for choosing Landscape Center, ${customerName}.`,
      cancelled: `${customerName}, your order #${orderId} has been cancelled. If you have questions, please contact us at (555) 123-4567.`,
    }

    return messages[orderStatus as keyof typeof messages] || `Order #${orderId} status update: ${orderStatus}`
  }

  generatePaymentConfirmationMessage(orderId: string, customerName: string, amount: number): string {
    return `${customerName}, payment of $${amount.toFixed(2)} for order #${orderId} has been processed successfully. Thank you!`
  }

  generateDeliveryScheduleMessage(
    orderId: string,
    customerName: string,
    deliveryDate: string,
    timeWindow: string,
  ): string {
    return `${customerName}, your order #${orderId} is scheduled for delivery on ${deliveryDate} between ${timeWindow}. Please ensure someone is available to receive the delivery.`
  }
}
