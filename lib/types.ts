export interface Product {
  id: string
  sku: string
  name_en: string
  name_es: string
  description_en?: string
  description_es?: string
  category_id: string
  price: number
  contractor_price?: number
  wholesale_price?: number
  stock_quantity: number
  min_order_quantity: number
  max_order_quantity?: number
  is_active: boolean
  requires_delivery: boolean
  delivery_fee: number
  images: string[]
  tags: string[]
  weight?: number
  dimensions?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_en: string
  name_es: string
  slug: string
  description_en?: string
  description_es?: string
  image_url?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  account_type: "retail" | "contractor" | "wholesale"
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  tax_amount: number
  delivery_fee: number
  total_amount: number
  currency: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  delivery_address: {
    firstName: string
    lastName: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }
  billing_address?: {
    firstName: string
    lastName: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }
  notes?: string
  zoho_purchase_order_id?: string
  zoho_purchase_order_number?: string
  zoho_books_id?: string
  created_at: string
  updated_at: string
}

export type Language = "en" | "es"
