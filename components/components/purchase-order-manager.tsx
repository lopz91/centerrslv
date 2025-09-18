"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"
import { FileText, RefreshCw, ExternalLink } from "lucide-react"

interface PurchaseOrderManagerProps {
  orderId: string
  orderNumber: string
  language: "en" | "es"
  zohoPurchaseOrderId?: string
  zohoPurchaseOrderNumber?: string
  onStatusUpdate?: (newStatus: string) => void
}

export function PurchaseOrderManager({
  orderId,
  orderNumber,
  language,
  zohoPurchaseOrderId,
  zohoPurchaseOrderNumber,
  onStatusUpdate,
}: PurchaseOrderManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const t = useTranslation(language)

  const handleCreatePurchaseOrder = async () => {
    setIsCreating(true)

    try {
      const response = await fetch("/api/purchase-orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create purchase order")
      }

      toast.success(language === "es" ? "Orden de compra creada exitosamente" : "Purchase order created successfully")

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error creating purchase order:", error)
      toast.error(language === "es" ? "Error al crear orden de compra" : "Error creating purchase order")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSyncStatus = async () => {
    setIsSyncing(true)

    try {
      const response = await fetch("/api/purchase-orders/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync purchase order status")
      }

      toast.success(language === "es" ? "Estado sincronizado exitosamente" : "Status synced successfully")

      if (onStatusUpdate && data.status) {
        onStatusUpdate(data.status)
      }
    } catch (error) {
      console.error("Error syncing purchase order status:", error)
      toast.error(language === "es" ? "Error al sincronizar estado" : "Error syncing status")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-400" />
          {language === "es" ? "Gestión de Orden de Compra" : "Purchase Order Management"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {zohoPurchaseOrderId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  {language === "es" ? "Número de Orden de Compra" : "Purchase Order Number"}
                </p>
                <p className="font-semibold text-white">{zohoPurchaseOrderNumber}</p>
              </div>
              <Badge className="bg-green-400/10 text-green-400 border-green-400/20">
                {language === "es" ? "Creada" : "Created"}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSyncStatus}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {language === "es" ? "Sincronizar Estado" : "Sync Status"}
              </Button>

              <Button
                onClick={() =>
                  window.open(`https://books.zoho.com/app/purchaseorders/${zohoPurchaseOrderId}`, "_blank")
                }
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === "es" ? "Ver en Zoho" : "View in Zoho"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-zinc-400 mb-4">
                {language === "es"
                  ? "No se ha creado una orden de compra para este pedido"
                  : "No purchase order has been created for this order"}
              </p>
              <Button
                onClick={handleCreatePurchaseOrder}
                disabled={isCreating}
                className="bg-amber-400 hover:bg-amber-300 text-black font-semibold"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {language === "es" ? "Creando..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {language === "es" ? "Crear Orden de Compra" : "Create Purchase Order"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-zinc-500 text-center">
          {language === "es"
            ? "Las órdenes de compra se sincronizan automáticamente con Zoho Books"
            : "Purchase orders are automatically synced with Zoho Books"}
        </div>
      </CardContent>
    </Card>
  )
}
