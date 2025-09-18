-- Create product calculators table for admin-managed calculation tools
CREATE TABLE IF NOT EXISTS product_calculators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('tonnage', 'square_footage')),
  formula TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_product_calculators_category ON product_calculators(category);
CREATE INDEX IF NOT EXISTS idx_product_calculators_type ON product_calculators(type);
CREATE INDEX IF NOT EXISTS idx_product_calculators_active ON product_calculators(is_active);

-- Enable RLS
ALTER TABLE product_calculators ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_calculators
CREATE POLICY "Anyone can view active calculators" ON product_calculators
  FOR SELECT USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can manage all calculators" ON product_calculators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create calculator usage log table for analytics
CREATE TABLE IF NOT EXISTS calculator_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calculator_id UUID REFERENCES product_calculators(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  input_values JSONB NOT NULL,
  calculated_result JSONB NOT NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for usage analytics
CREATE INDEX IF NOT EXISTS idx_calculator_usage_log_calculator_id ON calculator_usage_log(calculator_id);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_log_created_at ON calculator_usage_log(created_at);

-- Enable RLS for usage log
ALTER TABLE calculator_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for calculator usage log
CREATE POLICY "Users can view their own usage logs" ON calculator_usage_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage logs" ON calculator_usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Anyone can insert usage logs (for anonymous users)
CREATE POLICY "Anyone can log calculator usage" ON calculator_usage_log
  FOR INSERT WITH CHECK (true);
