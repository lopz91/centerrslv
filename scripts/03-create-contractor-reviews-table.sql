-- Create contractor reviews table
CREATE TABLE IF NOT EXISTS contractor_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  project_type VARCHAR(100),
  project_value DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_contractor_id ON contractor_reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_customer_id ON contractor_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_rating ON contractor_reviews(rating);

-- Enable RLS
ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view verified reviews" ON contractor_reviews
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Customers can insert their own reviews" ON contractor_reviews
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own reviews" ON contractor_reviews
  FOR UPDATE USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );
