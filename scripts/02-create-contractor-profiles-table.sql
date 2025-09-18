-- Create contractor profiles table for Find a Pro platform
CREATE TABLE IF NOT EXISTS contractor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  specialties TEXT[] DEFAULT '{}',
  license_number VARCHAR(100),
  insurance_verified BOOLEAN DEFAULT FALSE,
  website_url VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  tiktok_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  google_business_url VARCHAR(255),
  google_rating DECIMAL(2,1) DEFAULT 0.0,
  google_review_count INTEGER DEFAULT 0,
  profile_image_url VARCHAR(500),
  gallery_images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  years_in_business INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  spend_tier VARCHAR(20) DEFAULT 'bronze' CHECK (spend_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_customer_id ON contractor_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_is_verified ON contractor_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_is_featured ON contractor_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_specialties ON contractor_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_service_areas ON contractor_profiles USING GIN(service_areas);

-- Enable RLS
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view verified contractor profiles" ON contractor_profiles
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Contractors can view their own profile" ON contractor_profiles
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update their own profile" ON contractor_profiles
  FOR UPDATE USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can insert their own profile" ON contractor_profiles
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );
