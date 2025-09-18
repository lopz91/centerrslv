"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText, Send, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  status: string
  created_date: string
  zoho_invoice_id?: string
}

export function ZohoInvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateInvoice = async () => {
    if (!selectedOrderId) {
      toast({
        title: "Order Required",
        description: "Please select an order to generate invoice",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/zoho/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Invoice Generated",
          description: `Invoice ${result.invoiceNumber} created successfully`,
        })
        setSelectedOrderId("")
        // Refresh invoices list
        fetchInvoices()
      } else {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/zoho/invoices")
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500"
      case "sent":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-amber-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Invoice Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Invoice
          </CardTitle>
          <CardDescription>Create invoices in Zoho Books from completed orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order-select">Select Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order-001">Order #001 - John Doe - $1,250.00</SelectItem>
                  <SelectItem value="order-002">Order #002 - Jane Smith - $890.50</SelectItem>
                  <SelectItem value="order-003">Order #003 - ABC Landscaping - $3,200.00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateInvoice} disabled={isGenerating || !selectedOrderId} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Invoices generated in Zoho Books</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sample invoices for demo */}
              {[
                {
                  id: "inv-001",
                  invoice_number: "INV-2024-001",
                  customer_name: "John Doe",
                  total_amount: 1250.0,
                  status: "sent",
                  created_date: "2024-01-15",
                },
                {
                  id: "inv-002",
                  invoice_number: "INV-2024-002",
                  customer_name: "Jane Smith",
                  total_amount: 890.5,
                  status: "paid",
                  created_date: "2024-01-14",
                },
                {
                  id: "inv-003",
                  invoice_number: "INV-2024-003",
                  customer_name: "ABC Landscaping",
                  total_amount: 3200.0,
                  status: "draft",
                  created_date: "2024-01-13",
                },
              ].map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                    </div>
                    <Badge className={`${getStatusColor(invoice.status)} text-white`}>{invoice.status}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${invoice.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{invoice.created_date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
