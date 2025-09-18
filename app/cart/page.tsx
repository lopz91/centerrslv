"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartItem } from "@/components/cart-item"
import { CartSummary } from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { getCartItems, updateCartItemQuantity, removeCartItem } from "@/lib/cart-utils"
import type { CartItem as CartItemType, Product, Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function CartPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [cartItems, setCartItems] = useState<(CartItemType & { product: Product })[]>([])
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingItemId, setUpdatingItemId] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const t = useTranslation(language)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoadCart()
  }, [])

  const checkAuthAndLoadCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setIsLoading(false)
        return
      }

      setIsLoggedIn(true)

      // Load user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setUserProfile(profile)
      }

      // Load cart items
      const items = await getCartItems()
      setCartItems(items)
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingItemId(itemId)

    try {
      const result = await updateCartItemQuantity(itemId, quantity)

      if (result.success) {
        setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
        toast.success(language === "es" ? "Cantidad actualizada" : "Quantity updated")
      } else {
        toast.error(result.error || (language === "es" ? "Error al actualizar" : "Update failed"))
      }
    } catch (error) {
      toast.error(language === "es" ? "Error al actualizar" : "Update failed")
    } finally {
      setUpdatingItemId("")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItemId(itemId)

    try {
      const result = await removeCartItem(itemId)

      if (result.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
        toast.success(language === "es" ? "Producto eliminado" : "Item removed")
      } else {
        toast.error(result.error || (language === "es" ? "Error al eliminar" : "Remove failed"))
      }
    } catch (error) {
      toast.error(language === "es" ? "Error al eliminar" : "Remove failed")
    } finally {
      setUpdatingItemId("")
    }
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push("/auth/login?redirect=/cart")
      return
    }

    router.push("/checkout")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {language === "es" ? "Inicia Sesión Requerida" : "Login Required"}
              </h2>
              <p className="text-zinc-400 mb-6">
                {language === "es"
                  ? "Debes iniciar sesión para ver tu carrito de compras"
                  : "You need to log in to view your shopping cart"}
              </p>
              <div className="space-y-4">
                <Link href="/auth/login?redirect=/cart">
                  <Button className="w-full bg-amber-400 hover:bg-amber-300 text-black">{t.login}</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
                  >
                    {t.signup}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        cartItemCount={cartItems.length}
        isLoggedIn={isLoggedIn}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {language === "es" ? "Carrito de Compras" : "Shopping Cart"}
            </h1>
            <p className="text-zinc-400">
              {language === "es"
                ? "Revisa tus productos antes de proceder al checkout"
                : "Review your items before proceeding to checkout"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{t.cartEmpty}</h3>
                    <p className="text-zinc-400 mb-6">
                      {language === "es"
                        ? "Explora nuestros productos y agrega algunos a tu carrito"
                        : "Browse our products and add some to your cart"}
                    </p>
                    <Link href="/products">
                      <Button className="bg-amber-400 hover:bg-amber-300 text-black">{t.continueShopping}</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      language={language}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      isUpdating={updatingItemId === item.id}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                items={cartItems}
                language={language}
                userProfile={userProfile}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
