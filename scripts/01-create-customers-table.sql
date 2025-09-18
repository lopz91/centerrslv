-- Create customers table for user profiles
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  is_contractor BOOLEAN DEFAULT FALSE,
  contractor_tier VARCHAR(20) DEFAULT 'standard' CHECK (contractor_tier IN ('standard', 'premium', 'elite')),
  special_pricing_approved BOOLEAN DEFAULT FALSE,
  zoho_contact_id VARCHAR(100),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_contractor ON customers(is_contractor);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own customer profile" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer profile" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer profile" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
