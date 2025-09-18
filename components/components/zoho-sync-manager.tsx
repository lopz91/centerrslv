"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Upload, Download, Users } from "lucide-react"

interface ZohoSyncManagerProps {
  customerId: string
  customerName: string
  customerEmail: string
  zohoId?: string
  lastSyncAt?: string
}

export function ZohoSyncManager({ customerId, customerName, customerEmail, zohoId, lastSyncAt }: ZohoSyncManagerProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDirection, setSyncDirection] = useState<"to_zoho" | "from_zoho" | null>(null)
  const { toast } = useToast()

  const handleSync = async (direction: "to_zoho" | "from_zoho") => {
    setIsSyncing(true)
    setSyncDirection(direction)

    try {
      const response = await fetch("/api/zoho/sync-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          direction,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Customer ${direction === "to_zoho" ? "synced to" : "updated from"} Zoho CRM`,
        })

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync with Zoho CRM",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setSyncDirection(null)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Zoho CRM Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Customer</div>
          <div className="text-sm text-muted-foreground">
            {customerName} - {customerEmail}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Zoho Status</div>
          <div className="flex items-center gap-2">
            {zohoId ? (
              <Badge variant="default">Linked (ID: {zohoId.slice(-8)})</Badge>
            ) : (
              <Badge variant="secondary">Not Linked</Badge>
            )}
          </div>
        </div>

        {lastSyncAt && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Last Sync</div>
            <div className="text-sm text-muted-foreground">
              {new Date(lastSyncAt).toLocaleDateString()} at {new Date(lastSyncAt).toLocaleTimeString()}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleSync("to_zoho")}
            disabled={isSyncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isSyncing && syncDirection === "to_zoho" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            To Zoho
          </Button>

          <Button
            onClick={() => handleSync("from_zoho")}
            disabled={isSyncing || !zohoId}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isSyncing && syncDirection === "from_zoho" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            From Zoho
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Sync customer data between your website and Zoho CRM to maintain consistent customer information across
          platforms.
        </div>
      </CardContent>
    </Card>
  )
}
