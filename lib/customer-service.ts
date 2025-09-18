import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface CustomerProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  company_name?: string
  is_contractor: boolean
  contractor_tier: "standard" | "premium" | "elite"
  special_pricing_approved: boolean
  zoho_contact_id?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  created_at: string
  updated_at: string
}

export interface ContractorProfile {
  id: string
  customer_id: string
  business_name: string
  description?: string
  specialties: string[]
  license_number?: string
  insurance_verified: boolean
  website_url?: string
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  linkedin_url?: string
  google_business_url?: string
  google_rating?: number
  google_review_count: number
  profile_image_url?: string
  gallery_images: string[]
  videos: string[]
  service_areas: string[]
  years_in_business?: number
  is_verified: boolean
  is_featured: boolean
  spend_tier: "bronze" | "silver" | "gold" | "platinum"
  created_at: string
  updated_at: string
}

// Server-side functions
export async function createCustomerProfile(userData: {
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  company_name?: string
  account_type: "retail" | "contractor" | "wholesale"
}) {
  const supabase = createClient()

  const customerData = {
    user_id: userData.user_id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone,
    company_name: userData.company_name,
    is_contractor: userData.account_type === "contractor",
    contractor_tier: userData.account_type === "wholesale" ? "premium" : "standard",
    special_pricing_approved: userData.account_type === "wholesale",
  }

  const { data, error } = await supabase.from("customers").insert(customerData).select().single()

  if (error) throw error

  // If contractor, create contractor profile
  if (userData.account_type === "contractor" && userData.company_name) {
    await createContractorProfile({
      customer_id: data.id,
      business_name: userData.company_name,
      description: "",
      specialties: [],
      service_areas: ["Las Vegas, NV"],
    })
  }

  return data
}

export async function createContractorProfile(profileData: {
  customer_id: string
  business_name: string
  description?: string
  specialties: string[]
  service_areas: string[]
}) {
  const supabase = createClient()

  const { data, error } = await supabase.from("contractor_profiles").insert(profileData).select().single()

  if (error) throw error
  return data
}

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("customers").select("*").eq("user_id", userId).single()

  if (error) return null
  return data
}

export async function getContractorProfile(customerId: string): Promise<ContractorProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("contractor_profiles").select("*").eq("customer_id", customerId).single()

  if (error) return null
  return data
}

// Client-side functions
export async function updateCustomerProfile(userId: string, updates: Partial<CustomerProfile>) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("customers").update(updates).eq("user_id", userId).select().single()

  if (error) throw error
  return data
}

export async function updateContractorProfile(customerId: string, updates: Partial<ContractorProfile>) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("contractor_profiles")
    .update(updates)
    .eq("customer_id", customerId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function syncCustomerToZoho(customerId: string) {
  try {
    const response = await fetch("/api/zoho/sync-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId }),
    })

    if (!response.ok) {
      throw new Error("Failed to sync customer to Zoho")
    }

    return await response.json()
  } catch (error) {
    console.error("Error syncing customer to Zoho:", error)
    throw error
  }
}
