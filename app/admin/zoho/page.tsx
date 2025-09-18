"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZohoProductSync } from "@/components/admin/zoho-product-sync"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, FileText, Package, Truck } from "lucide-react"
import { ZohoInvoiceManager } from "@/components/admin/zoho-invoice-manager"

export default function ZohoAdminPage() {
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const integrationStatus = [
    {
      name: "Product Sync",
      status: "active",
      description: "Automatic synchronization with Zoho Books inventory",
      icon: Package,
    },
    {
      name: "Customer Sync",
      status: "active",
      description: "Bidirectional sync with Zoho CRM contacts",
      icon: Users,
    },
    {
      name: "Purchase Orders",
      status: "active",
      description: "Create and manage purchase orders in Zoho Books",
      icon: FileText,
    },
    {
      name: "Delivery Challans",
      status: "active",
      description: "Generate delivery documents for shipments",
      icon: Truck,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-playfair)]">
            Zoho Integration Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage synchronization between your landscape center and Zoho Books/CRM
          </p>
        </div>
        <Badge variant="default" className="bg-primary text-primary-foreground">
          <Database className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrationStatus.map((integration, index) => (
          <Card key={index} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <integration.icon className="h-5 w-5 text-primary" />
                <Badge
                  variant={integration.status === "active" ? "default" : "secondary"}
                  className={integration.status === "active" ? "bg-green-500 text-white" : ""}
                >
                  {integration.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-card-foreground text-sm mb-1">{integration.name}</h3>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ZohoProductSync />

          <Card>
            <CardHeader>
              <CardTitle>Product Sync Statistics</CardTitle>
              <CardDescription>Overview of product synchronization activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Synced Today</p>
                  <p className="text-2xl font-bold text-primary">23</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                  <p className="text-2xl font-bold text-foreground">2h ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Synchronization</CardTitle>
              <CardDescription>Manage customer data sync between website and Zoho CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Users className="h-5 w-5" />
                  <span>Sync All Customers</span>
                  <span className="text-xs text-muted-foreground">To Zoho CRM</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <RefreshCw className="h-5 w-5" />
                  <span>Update from CRM</span>
                  <span className="text-xs text-muted-foreground">From Zoho CRM</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold text-foreground">892</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Linked to CRM</p>
                  <p className="text-2xl font-bold text-primary">743</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Pending Sync</p>
                  <p className="text-2xl font-bold text-accent">149</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <ZohoInvoiceManager />

          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Purchase orders, invoices, and delivery challans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileText className="h-5 w-5" />
                  <span>Purchase Orders</span>
                  <span className="text-xs text-muted-foreground">Manage POs</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileText className="h-5 w-5" />
                  <span>Invoices</span>
                  <span className="text-xs text-muted-foreground">Generate invoices</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Truck className="h-5 w-5" />
                  <span>Delivery Challans</span>
                  <span className="text-xs text-muted-foreground">Shipping docs</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Open POs</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold text-primary">8</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Ready to Ship</p>
                  <p className="text-2xl font-bold text-accent">15</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure Zoho Books and CRM integration parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-card-foreground">Auto Product Sync</h4>
                    <p className="text-sm text-muted-foreground">Automatically sync products every 6 hours</p>
                  </div>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-card-foreground">Customer Sync</h4>
                    <p className="text-sm text-muted-foreground">Sync new customers to CRM on registration</p>
                  </div>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-card-foreground">Order Webhooks</h4>
                    <p className="text-sm text-muted-foreground">Receive real-time updates from Zoho Books</p>
                  </div>
                  <Badge variant="secondary">Pending Setup</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-card-foreground mb-2">Environment Variables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 p-2 rounded">
                    <span className="text-muted-foreground">ZOHO_ACCESS_TOKEN:</span>
                    <span className="text-green-600 ml-1">✓ Set</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <span className="text-muted-foreground">ZOHO_ORGANIZATION_ID:</span>
                    <span className="text-green-600 ml-1">✓ Set</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
