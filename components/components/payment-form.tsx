"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Lock } from "lucide-react"

interface PaymentFormProps {
  orderId: string
  totalAmount: number
  onPaymentSuccess: (transactionId: string) => void
  onPaymentError: (error: string) => void
}

export function PaymentForm({ orderId, totalAmount, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          billingAddress,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Transaction ID: ${result.transactionId}`,
        })
        onPaymentSuccess(result.transactionId)
      } else {
        toast({
          title: "Payment Failed",
          description: result.error,
          variant: "destructive",
        })
        onPaymentError(result.error)
      }
    } catch (error) {
      const errorMessage = "Payment processing failed. Please try again."
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      })
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="ach">ACH Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-name">Billing Name</Label>
            <Input
              id="billing-name"
              value={billingAddress.name}
              onChange={(e) => setBillingAddress((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-address">Billing Address</Label>
            <Input
              id="billing-address"
              value={billingAddress.address}
              onChange={(e) => setBillingAddress((prev) => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input
                id="billing-city"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-state">State</Label>
              <Input
                id="billing-state"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-zip">ZIP Code</Label>
            <Input
              id="billing-zip"
              value={billingAddress.zipCode}
              onChange={(e) => setBillingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
              required
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</span>
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <Lock className="h-3 w-3 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
