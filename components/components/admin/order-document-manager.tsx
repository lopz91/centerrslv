"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileText, Truck, Package, RefreshCw } from "lucide-react"

interface OrderDocumentManagerProps {
  orderId: string
  orderStatus: string
  paymentStatus: string
  zohoInvoiceId?: string
  zohoInvoiceNumber?: string
  zohoShippingTicketId?: string
  zohoShippingTicketNumber?: string
  zohoPurchaseOrderId?: string
  zohoPurchaseOrderNumber?: string
  onDocumentsUpdated?: () => void
}

export function OrderDocumentManager({
  orderId,
  orderStatus,
  paymentStatus,
  zohoInvoiceId,
  zohoInvoiceNumber,
  zohoShippingTicketId,
  zohoShippingTicketNumber,
  zohoPurchaseOrderId,
  zohoPurchaseOrderNumber,
  onDocumentsUpdated,
}: OrderDocumentManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreateDocuments = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/orders/process-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          orderStatus,
          paymentStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Documents created: ${result.documentsCreated.join(", ")}`)
        onDocumentsUpdated?.()
      } else {
        toast.error(`Failed to create documents: ${result.errors.join(", ")}`)
      }
    } catch (error) {
      console.error("Error creating documents:", error)
      toast.error("Failed to create documents")
    } finally {
      setIsProcessing(false)
    }
  }

  const getDocumentStatus = (documentId?: string) => {
    return documentId ? "created" : "pending"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return (
          <Badge variant="default" className="bg-green-600">
            Created
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Zoho Books Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-zinc-300">Invoice</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getStatusBadge(getDocumentStatus(zohoInvoiceId))}
              {zohoInvoiceNumber && <span className="text-xs text-zinc-400">{zohoInvoiceNumber}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-400" />
              <span className="text-sm text-zinc-300">Shipping Ticket</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getStatusBadge(getDocumentStatus(zohoShippingTicketId))}
              {zohoShippingTicketNumber && <span className="text-xs text-zinc-400">{zohoShippingTicketNumber}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-300">Purchase Order</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getStatusBadge(getDocumentStatus(zohoPurchaseOrderId))}
              {zohoPurchaseOrderNumber && <span className="text-xs text-zinc-400">{zohoPurchaseOrderNumber}</span>}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleCreateDocuments}
            disabled={isProcessing}
            className="bg-amber-400 hover:bg-amber-300 text-black"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing Documents...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Create/Update Documents
              </>
            )}
          </Button>
        </div>

        {/* Status Info */}
        <div className="text-xs text-zinc-400 space-y-1">
          <p>• Invoice: Created when order is paid and confirmed</p>
          <p>• Shipping Ticket: Created when order is processing/shipped</p>
          <p>• Purchase Order: Created when order is confirmed</p>
          <p>• Shipping address must be populated for all documents</p>
        </div>
      </CardContent>
    </Card>
  )
}
