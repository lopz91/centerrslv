"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/lib/i18n"
import type { Profile } from "@/lib/types"

interface CheckoutFormProps {
  language: "en" | "es"
  userProfile?: Profile | null
  onSubmit: (orderData: any) => void
  isProcessing?: boolean
}

export function CheckoutForm({ language, userProfile, onSubmit, isProcessing }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    // Delivery Address
    deliveryFirstName: userProfile?.first_name || "",
    deliveryLastName: userProfile?.last_name || "",
    deliveryCompany: userProfile?.company_name || "",
    deliveryAddress: userProfile?.address || "",
    deliveryCity: userProfile?.city || "",
    deliveryState: userProfile?.state || "NV",
    deliveryZip: userProfile?.zip_code || "",
    deliveryPhone: userProfile?.phone || "",

    // Billing Address
    billingFirstName: userProfile?.first_name || "",
    billingLastName: userProfile?.last_name || "",
    billingCompany: userProfile?.company_name || "",
    billingAddress: userProfile?.address || "",
    billingCity: userProfile?.city || "",
    billingState: userProfile?.state || "NV",
    billingZip: userProfile?.zip_code || "",
    billingPhone: userProfile?.phone || "",

    // Options
    sameAsDelivery: true,
    notes: "",
    paymentMethod: "credit_card",
  })

  const t = useTranslation(language)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSameAsDeliveryChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsDelivery: checked,
      ...(checked
        ? {
            billingFirstName: prev.deliveryFirstName,
            billingLastName: prev.deliveryLastName,
            billingCompany: prev.deliveryCompany,
            billingAddress: prev.deliveryAddress,
            billingCity: prev.deliveryCity,
            billingState: prev.deliveryState,
            billingZip: prev.deliveryZip,
            billingPhone: prev.deliveryPhone,
          }
        : {}),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const states = [
    { value: "NV", label: "Nevada" },
    { value: "CA", label: "California" },
    { value: "AZ", label: "Arizona" },
    { value: "UT", label: "Utah" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Address */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "es" ? "Dirección de Entrega" : "Delivery Address"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Nombre" : "First Name"}</Label>
              <Input
                value={formData.deliveryFirstName}
                onChange={(e) => handleInputChange("deliveryFirstName", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Apellido" : "Last Name"}</Label>
              <Input
                value={formData.deliveryLastName}
                onChange={(e) => handleInputChange("deliveryLastName", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">{language === "es" ? "Empresa (Opcional)" : "Company (Optional)"}</Label>
            <Input
              value={formData.deliveryCompany}
              onChange={(e) => handleInputChange("deliveryCompany", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">{language === "es" ? "Dirección" : "Address"}</Label>
            <Input
              value={formData.deliveryAddress}
              onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Ciudad" : "City"}</Label>
              <Input
                value={formData.deliveryCity}
                onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Estado" : "State"}</Label>
              <Select
                value={formData.deliveryState}
                onValueChange={(value) => handleInputChange("deliveryState", value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Código Postal" : "Zip Code"}</Label>
              <Input
                value={formData.deliveryZip}
                onChange={(e) => handleInputChange("deliveryZip", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">{language === "es" ? "Teléfono" : "Phone"}</Label>
            <Input
              value={formData.deliveryPhone}
              onChange={(e) => handleInputChange("deliveryPhone", e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            {language === "es" ? "Dirección de Facturación" : "Billing Address"}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsDelivery"
                checked={formData.sameAsDelivery}
                onCheckedChange={handleSameAsDeliveryChange}
              />
              <Label htmlFor="sameAsDelivery" className="text-sm text-zinc-300">
                {language === "es" ? "Igual que la entrega" : "Same as delivery"}
              </Label>
            </div>
          </CardTitle>
        </CardHeader>
        {!formData.sameAsDelivery && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Nombre" : "First Name"}</Label>
                <Input
                  value={formData.billingFirstName}
                  onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Apellido" : "Last Name"}</Label>
                <Input
                  value={formData.billingLastName}
                  onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Empresa (Opcional)" : "Company (Optional)"}</Label>
              <Input
                value={formData.billingCompany}
                onChange={(e) => handleInputChange("billingCompany", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Dirección" : "Address"}</Label>
              <Input
                value={formData.billingAddress}
                onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Ciudad" : "City"}</Label>
                <Input
                  value={formData.billingCity}
                  onChange={(e) => handleInputChange("billingCity", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Estado" : "State"}</Label>
                <Select
                  value={formData.billingState}
                  onValueChange={(value) => handleInputChange("billingState", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Código Postal" : "Zip Code"}</Label>
                <Input
                  value={formData.billingZip}
                  onChange={(e) => handleInputChange("billingZip", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">{language === "es" ? "Teléfono" : "Phone"}</Label>
              <Input
                value={formData.billingPhone}
                onChange={(e) => handleInputChange("billingPhone", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Order Notes */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "es" ? "Notas del Pedido (Opcional)" : "Order Notes (Optional)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder={
              language === "es" ? "Instrucciones especiales de entrega..." : "Special delivery instructions..."
            }
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold py-3"
      >
        {isProcessing
          ? language === "es"
            ? "Procesando..."
            : "Processing..."
          : language === "es"
            ? "Realizar Pedido"
            : "Place Order"}
      </Button>
    </form>
  )
}
