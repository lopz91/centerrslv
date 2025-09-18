-- Create customers table with contractor pricing support
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  is_contractor BOOLEAN DEFAULT FALSE,
  contractor_tier VARCHAR(20) DEFAULT 'standard', -- standard, premium, elite
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

-- Create contractor profiles for Find a Pro
CREATE TABLE IF NOT EXISTS contractor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  specialties TEXT[],
  license_number VARCHAR(100),
  insurance_verified BOOLEAN DEFAULT FALSE,
  website_url VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  tiktok_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  google_business_url VARCHAR(255),
  google_rating DECIMAL(2,1),
  google_review_count INTEGER DEFAULT 0,
  profile_image_url VARCHAR(255),
  gallery_images TEXT[],
  videos TEXT[],
  service_areas TEXT[],
  years_in_business INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  spend_tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contractor posts for Find a Pro social features
CREATE TABLE IF NOT EXISTS contractor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_profile_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[],
  videos TEXT[],
  tagged_products UUID[],
  project_location VARCHAR(255),
  project_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor profiles
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  website_url VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  products_offered TEXT[],
  discount_codes JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own customer data" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer data" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contractor profiles
CREATE POLICY "Anyone can view contractor profiles" ON contractor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Contractors can manage their own profiles" ON contractor_profiles
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for contractor posts
CREATE POLICY "Anyone can view contractor posts" ON contractor_posts
  FOR SELECT USING (true);

CREATE POLICY "Contractors can manage their own posts" ON contractor_posts
  FOR ALL USING (
    contractor_profile_id IN (
      SELECT cp.id FROM contractor_profiles cp
      JOIN customers c ON cp.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- RLS Policies for vendor profiles
CREATE POLICY "Anyone can view vendor profiles" ON vendor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own profiles" ON vendor_profiles
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );
