"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send } from "lucide-react"

interface OrderSMSManagerProps {
  orderId: string
  customerName: string
  customerPhone: string
  currentStatus: string
}

export function OrderSMSManager({ orderId, customerName, customerPhone, currentStatus }: OrderSMSManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [customMessage, setCustomMessage] = useState("")
  const [useCustomMessage, setUseCustomMessage] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const statusOptions = [
    { value: "confirmed", label: "Order Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "ready", label: "Ready for Pickup" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const handleSendSMS = async () => {
    setIsSending(true)

    try {
      const response = await fetch("/api/sms/send-order-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: selectedStatus,
          customMessage: useCustomMessage ? customMessage : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `Order update sent to ${customerPhone}`,
        })
        setCustomMessage("")
        setUseCustomMessage(false)
      } else {
        toast({
          title: "SMS Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "SMS Error",
        description: "Failed to send SMS notification",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Order Update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          <div className="text-sm text-muted-foreground">
            {customerName} - {customerPhone}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-status">Order Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="custom-message"
              checked={useCustomMessage}
              onChange={(e) => setUseCustomMessage(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="custom-message">Use custom message</Label>
          </div>
        </div>

        {useCustomMessage && (
          <div className="space-y-2">
            <Label htmlFor="custom-message-text">Custom Message</Label>
            <Textarea
              id="custom-message-text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message..."
              rows={3}
            />
          </div>
        )}

        <Button onClick={handleSendSMS} disabled={isSending} className="w-full">
          {isSending ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send SMS Update
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          SMS notifications help keep customers informed about their order status and delivery updates.
        </div>
      </CardContent>
    </Card>
  )
}
