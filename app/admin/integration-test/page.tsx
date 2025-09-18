"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AdminNav } from "@/components/admin/admin-nav"
import { CheckCircle, XCircle, Phone, Mail, Database, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TestResult {
  success: boolean
  message: string
  details?: any
}

export default function IntegrationTestPage() {
  const [zohoTest, setZohoTest] = useState<TestResult | null>(null)
  const [twilioTest, setTwilioTest] = useState<TestResult | null>(null)
  const [isTestingZoho, setIsTestingZoho] = useState(false)
  const [isTestingTwilio, setIsTestingTwilio] = useState(false)

  const [testData, setTestData] = useState({
    customerEmail: "Info@lvcenters.com",
    customerName: "Test Customer",
    customerPhone: "(702) 899-8989",
    smsMessage: "Test SMS from The Landscape Center - Integration working correctly!",
    testPhoneNumber: "(702) 899-8989",
  })

  const testZohoIntegration = async () => {
    setIsTestingZoho(true)
    setZohoTest(null)

    try {
      // Test Zoho connection
      const response = await fetch("/api/admin/zoho/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testCustomer: {
            email: testData.customerEmail,
            first_name: testData.customerName.split(" ")[0],
            last_name: testData.customerName.split(" ")[1] || "",
            phone: testData.customerPhone,
          },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setZohoTest({
          success: true,
          message: "Zoho integration test successful",
          details: result,
        })
        toast.success("Zoho test completed successfully")
      } else {
        setZohoTest({
          success: false,
          message: result.error || "Zoho test failed",
          details: result,
        })
        toast.error("Zoho test failed")
      }
    } catch (error) {
      setZohoTest({
        success: false,
        message: "Network error testing Zoho integration",
        details: error,
      })
      toast.error("Zoho test failed")
    } finally {
      setIsTestingZoho(false)
    }
  }

  const testTwilioIntegration = async () => {
    setIsTestingTwilio(true)
    setTwilioTest(null)

    try {
      // Test Twilio SMS
      const response = await fetch("/api/admin/twilio/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testData.testPhoneNumber,
          message: testData.smsMessage,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTwilioTest({
          success: true,
          message: "Twilio SMS test successful",
          details: result,
        })
        toast.success("Twilio test completed successfully")
      } else {
        setTwilioTest({
          success: false,
          message: result.error || "Twilio test failed",
          details: result,
        })
        toast.error("Twilio test failed")
      }
    } catch (error) {
      setTwilioTest({
        success: false,
        message: "Network error testing Twilio integration",
        details: error,
      })
      toast.error("Twilio test failed")
    } finally {
      setIsTestingTwilio(false)
    }
  }

  const testAllIntegrations = async () => {
    await testZohoIntegration()
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second between tests
    await testTwilioIntegration()
  }

  const getStatusIcon = (result: TestResult | null, isLoading: boolean) => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
    if (!result) return <AlertCircle className="h-5 w-5 text-zinc-500" />
    return result.success ? (
      <CheckCircle className="h-5 w-5 text-green-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    )
  }

  const getStatusBadge = (result: TestResult | null, isLoading: boolean) => {
    if (isLoading)
      return (
        <Badge variant="outline" className="text-amber-400 border-amber-400">
          Testing...
        </Badge>
      )
    if (!result)
      return (
        <Badge variant="outline" className="text-zinc-500 border-zinc-500">
          Not Tested
        </Badge>
      )
    return result.success ? (
      <Badge variant="outline" className="text-green-400 border-green-400">
        Success
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-400 border-red-400">
        Failed
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <AdminNav />

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Integration Testing</h1>
              <p className="text-zinc-400">Test Zoho and Twilio integrations to ensure they're working correctly</p>
            </div>

            {/* Test Controls */}
            <Card className="border-zinc-800 bg-zinc-900/50 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Test Configuration</CardTitle>
                <CardDescription>Configure test data for integration testing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerEmail" className="text-zinc-300">
                      Test Customer Email
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={testData.customerEmail}
                      onChange={(e) => setTestData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName" className="text-zinc-300">
                      Test Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={testData.customerName}
                      onChange={(e) => setTestData((prev) => ({ ...prev, customerName: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerPhone" className="text-zinc-300">
                      Customer Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={testData.customerPhone}
                      onChange={(e) => setTestData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testPhoneNumber" className="text-zinc-300">
                      SMS Test Phone Number
                    </Label>
                    <Input
                      id="testPhoneNumber"
                      type="tel"
                      value={testData.testPhoneNumber}
                      onChange={(e) => setTestData((prev) => ({ ...prev, testPhoneNumber: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smsMessage" className="text-zinc-300">
                    SMS Test Message
                  </Label>
                  <Textarea
                    id="smsMessage"
                    value={testData.smsMessage}
                    onChange={(e) => setTestData((prev) => ({ ...prev, smsMessage: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={testAllIntegrations}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                    disabled={isTestingZoho || isTestingTwilio}
                  >
                    {isTestingZoho || isTestingTwilio ? "Testing..." : "Test All Integrations"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Integration Status Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Zoho Integration */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-amber-400" />
                      <CardTitle className="text-white">Zoho Integration</CardTitle>
                    </div>
                    {getStatusIcon(zohoTest, isTestingZoho)}
                  </div>
                  <CardDescription>Customer sync and CRM integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Status:</span>
                    {getStatusBadge(zohoTest, isTestingZoho)}
                  </div>

                  {zohoTest && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-zinc-400">Message:</span>
                        <p className={`mt-1 ${zohoTest.success ? "text-green-400" : "text-red-400"}`}>
                          {zohoTest.message}
                        </p>
                      </div>

                      {zohoTest.details && (
                        <div className="text-sm">
                          <span className="text-zinc-400">Details:</span>
                          <pre className="mt-1 p-2 bg-zinc-800 rounded text-xs text-zinc-300 overflow-auto">
                            {JSON.stringify(zohoTest.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={testZohoIntegration}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    disabled={isTestingZoho}
                  >
                    {isTestingZoho ? "Testing Zoho..." : "Test Zoho Only"}
                  </Button>
                </CardContent>
              </Card>

              {/* Twilio Integration */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="h-6 w-6 text-amber-400" />
                      <CardTitle className="text-white">Twilio Integration</CardTitle>
                    </div>
                    {getStatusIcon(twilioTest, isTestingTwilio)}
                  </div>
                  <CardDescription>SMS notifications and messaging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Status:</span>
                    {getStatusBadge(twilioTest, isTestingTwilio)}
                  </div>

                  {twilioTest && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-zinc-400">Message:</span>
                        <p className={`mt-1 ${twilioTest.success ? "text-green-400" : "text-red-400"}`}>
                          {twilioTest.message}
                        </p>
                      </div>

                      {twilioTest.details && (
                        <div className="text-sm">
                          <span className="text-zinc-400">Details:</span>
                          <pre className="mt-1 p-2 bg-zinc-800 rounded text-xs text-zinc-300 overflow-auto">
                            {JSON.stringify(twilioTest.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={testTwilioIntegration}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    disabled={isTestingTwilio}
                  >
                    {isTestingTwilio ? "Testing Twilio..." : "Test Twilio Only"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Integration Health Summary */}
            <Card className="border-zinc-800 bg-zinc-900/50 mt-8">
              <CardHeader>
                <CardTitle className="text-white">Integration Health Summary</CardTitle>
                <CardDescription>Overall status of all integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <Mail className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Zoho CRM</h3>
                    <p className="text-sm text-zinc-400">Customer Management</p>
                    {getStatusBadge(zohoTest, isTestingZoho)}
                  </div>

                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <Phone className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Twilio SMS</h3>
                    <p className="text-sm text-zinc-400">Order Notifications</p>
                    {getStatusBadge(twilioTest, isTestingTwilio)}
                  </div>

                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <Database className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-1">Overall Health</h3>
                    <p className="text-sm text-zinc-400">System Status</p>
                    {zohoTest && twilioTest ? (
                      zohoTest.success && twilioTest.success ? (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Healthy
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-400 border-red-400">
                          Issues Detected
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-500">
                        Unknown
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
