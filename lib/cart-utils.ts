import { createClient } from "@/lib/supabase/client"
import type { CartItem, Product } from "@/lib/types"

export async function addToCart(productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Please log in to add items to cart" }
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("shopping_carts")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("shopping_carts")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)

      if (error) throw error
    } else {
      // Add new item
      const { error } = await supabase.from("shopping_carts").insert({
        user_id: user.id,
        product_id: productId,
        quantity,
      })

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { success: false, error: "Failed to add item to cart" }
  }
}

export async function getCartItems(): Promise<(CartItem & { product: Product })[]> {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("shopping_carts")
      .select(`
        *,
        product:products(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching cart items:", error)
    return []
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("shopping_carts").update({ quantity }).eq("id", itemId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { success: false, error: "Failed to update item quantity" }
  }
}

export async function removeCartItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("shopping_carts").delete().eq("id", itemId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error removing cart item:", error)
    return { success: false, error: "Failed to remove item from cart" }
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "User not authenticated" }

    const { error } = await supabase.from("shopping_carts").delete().eq("user_id", user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { success: false, error: "Failed to clear cart" }
  }
}
