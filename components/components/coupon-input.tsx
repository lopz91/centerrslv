"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface CouponInputProps {
  language: "en" | "es"
  orderTotal: number
  onCouponApplied: (coupon: {
    id: string
    code: string
    discountType: string
    discountAmount: number
    freeShipping: boolean
  }) => void
  onCouponRemoved: () => void
  appliedCoupon?: {
    id: string
    code: string
    discountType: string
    discountAmount: number
    freeShipping: boolean
  } | null
  disabled?: boolean
}

export function CouponInput({
  language,
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  disabled = false,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslation(language)

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderTotal,
        }),
      })

      const result = await response.json()

      if (result.valid) {
        onCouponApplied({
          id: result.coupon_id,
          code: couponCode.trim().toUpperCase(),
          discountType: result.discount_type,
          discountAmount: result.discount_amount,
          freeShipping: result.free_shipping || false,
        })
        setCouponCode("")
      } else {
        // Handle different error types
        switch (result.error) {
          case "invalid_code":
            setError(language === "es" ? "Código de cupón inválido" : "Invalid coupon code")
            break
          case "usage_limit_exceeded":
            setError(language === "es" ? "Este cupón ya no está disponible" : "This coupon is no longer available")
            break
          case "user_limit_exceeded":
            setError(language === "es" ? "Ya has usado este cupón" : "You have already used this coupon")
            break
          case "minimum_order_not_met":
            setError(
              language === "es"
                ? `Pedido mínimo de $${result.minimum_amount} requerido`
                : `Minimum order of $${result.minimum_amount} required`,
            )
            break
          default:
            setError(language === "es" ? "Error al validar cupón" : "Error validating coupon")
        }
      }
    } catch (error) {
      setError(language === "es" ? "Error al validar cupón" : "Error validating coupon")
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    setError(null)
  }

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <Label className="text-zinc-300">{language === "es" ? "Cupón Aplicado" : "Applied Coupon"}</Label>
        <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-400" />
            <div>
              <Badge variant="secondary" className="bg-green-700 text-green-100">
                {appliedCoupon.code}
              </Badge>
              <p className="text-sm text-green-400 mt-1">
                {appliedCoupon.discountType === "percentage"
                  ? `${((appliedCoupon.discountAmount / orderTotal) * 100).toFixed(0)}% ${language === "es" ? "descuento" : "off"}`
                  : appliedCoupon.discountType === "fixed_amount"
                    ? `$${appliedCoupon.discountAmount.toFixed(2)} ${language === "es" ? "descuento" : "off"}`
                    : language === "es"
                      ? "Envío gratis"
                      : "Free shipping"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            disabled={disabled}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon-code" className="text-zinc-300">
        {language === "es" ? "Código de Cupón" : "Coupon Code"}
      </Label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          type="text"
          placeholder={language === "es" ? "Ingresa código" : "Enter code"}
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase())
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              validateCoupon()
            }
          }}
          disabled={disabled || isValidating}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Button
          onClick={validateCoupon}
          disabled={disabled || isValidating || !couponCode.trim()}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
        >
          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : language === "es" ? "Aplicar" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
