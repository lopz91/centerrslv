-- Add promotion tracking fields to contractor profiles
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS monthly_promotion_budget DECIMAL(10,2) DEFAULT 0.00;

-- Create promotion analytics table
CREATE TABLE IF NOT EXISTS contractor_promotion_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_profile_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  profile_clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  spend_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_contractor_id ON contractor_promotion_analytics(contractor_profile_id);
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_date ON contractor_promotion_analytics(date);

-- Enable RLS on analytics table
ALTER TABLE contractor_promotion_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics
CREATE POLICY "Contractors can view their own analytics" ON contractor_promotion_analytics
  FOR SELECT USING (
    contractor_profile_id IN (
      SELECT id FROM contractor_profiles 
      WHERE customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
      )
    )
  );

-- Update contractor profiles to set default promotion dates for featured contractors
UPDATE contractor_profiles 
SET 
  promotion_start_date = NOW(),
  promotion_end_date = NOW() + INTERVAL '30 days',
  monthly_promotion_budget = CASE 
    WHEN spend_tier = 'bronze' THEN 49.00
    WHEN spend_tier = 'silver' THEN 99.00
    WHEN spend_tier = 'gold' THEN 199.00
    WHEN spend_tier = 'platinum' THEN 399.00
    ELSE 0.00
  END
WHERE is_featured = TRUE AND promotion_start_date IS NULL;
