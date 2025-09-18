"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, CheckCircle, XCircle } from "lucide-react"

export function TwilioSettings() {
  const [credentials, setCredentials] = useState({
    accountSid: "",
    authToken: "",
    phoneNumber: "",
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkTwilioConnection()
  }, [])

  const checkTwilioConnection = async () => {
    try {
      const response = await fetch("/api/admin/twilio/status")
      const result = await response.json()
      setIsConnected(result.connected)

      if (result.connected) {
        setCredentials({
          accountSid: result.accountSid || "",
          authToken: "••••••••••••••••", // Masked for security
          phoneNumber: result.phoneNumber || "",
        })
      }
    } catch (error) {
      console.error("Error checking Twilio connection:", error)
    }
  }

  const handleSaveCredentials = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/twilio/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (result.success) {
        setIsConnected(true)
        toast({
          title: "Twilio Configured",
          description: "SMS notifications are now active",
        })
      } else {
        toast({
          title: "Configuration Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Twilio credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestSMS = async () => {
    setIsTesting(true)

    try {
      const response = await fetch("/api/admin/twilio/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: credentials.phoneNumber, // Test by sending to the configured number
          message: "Test message from Landscape Center - SMS notifications are working!",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Test SMS Sent",
          description: "Check your phone for the test message",
        })
      } else {
        toast({
          title: "Test Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to send test SMS",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-400" />
          Twilio SMS Configuration
          {isConnected ? (
            <Badge className="bg-green-400/10 text-green-400 border-green-400/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-red-400/10 text-red-400 border-red-400/20">
              <XCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-sid" className="text-zinc-300">
              Account SID
            </Label>
            <Input
              id="account-sid"
              type="text"
              value={credentials.accountSid}
              onChange={(e) => setCredentials({ ...credentials, accountSid: e.target.value })}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-token" className="text-zinc-300">
              Auth Token
            </Label>
            <Input
              id="auth-token"
              type="password"
              value={credentials.authToken}
              onChange={(e) => setCredentials({ ...credentials, authToken: e.target.value })}
              placeholder="Your Twilio Auth Token"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number" className="text-zinc-300">
              Twilio Phone Number
            </Label>
            <Input
              id="phone-number"
              type="tel"
              value={credentials.phoneNumber}
              onChange={(e) => setCredentials({ ...credentials, phoneNumber: e.target.value })}
              placeholder="+1234567890"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveCredentials}
            disabled={isLoading || !credentials.accountSid || !credentials.authToken || !credentials.phoneNumber}
            className="bg-amber-400 hover:bg-amber-300 text-black"
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>

          {isConnected && (
            <Button
              onClick={handleTestSMS}
              disabled={isTesting}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
            >
              {isTesting ? "Testing..." : "Send Test SMS"}
            </Button>
          )}
        </div>

        <div className="text-sm text-zinc-400 space-y-2">
          <p>
            <strong>Setup Instructions:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Sign up for a Twilio account at twilio.com</li>
            <li>Get your Account SID and Auth Token from the Twilio Console</li>
            <li>Purchase a phone number or use your trial number</li>
            <li>Enter the credentials above and click "Save Configuration"</li>
            <li>Test the integration with the "Send Test SMS" button</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
