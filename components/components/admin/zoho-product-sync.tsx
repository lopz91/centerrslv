"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SyncResult {
  success: boolean
  syncedCount?: number
  syncedProducts?: string[]
  error?: string
}

export function ZohoProductSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    try {
      const response = await fetch("/api/zoho/sync-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const result = await response.json()
      setSyncResult(result.data)
      setLastSync(new Date())

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
        })
      } else {
        toast({
          title: "Sync Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setSyncResult({ success: false, error: errorMessage })
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Zoho Books Product Sync
        </CardTitle>
        <CardDescription>Synchronize products from Zoho Books to your website catalog</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Last Sync</p>
            <p className="text-sm text-muted-foreground">{lastSync ? lastSync.toLocaleString() : "Never"}</p>
          </div>
          <Button onClick={handleSync} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        {syncResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {syncResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">{syncResult.success ? "Sync Completed" : "Sync Failed"}</span>
            </div>

            {syncResult.success && syncResult.syncedCount && (
              <div className="space-y-2">
                <Badge variant="secondary">{syncResult.syncedCount} products synced</Badge>
                {syncResult.syncedProducts && syncResult.syncedProducts.length > 0 && (
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-1">Synced products:</p>
                    <div className="space-y-1">
                      {syncResult.syncedProducts.slice(0, 10).map((product, index) => (
                        <p key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {product}
                        </p>
                      ))}
                      {syncResult.syncedProducts.length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          ...and {syncResult.syncedProducts.length - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!syncResult.success && syncResult.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{syncResult.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Products are automatically matched by Zoho Item ID</p>
          <p>• Existing products will be updated with latest information</p>
          <p>• New products will be added to your catalog</p>
        </div>
      </CardContent>
    </Card>
  )
}
