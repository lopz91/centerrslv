-- Create coupons table for discount codes and promotions
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_es TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_usage_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applies_to VARCHAR(20) DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product', 'user_type')),
  applies_to_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID,
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promotional campaigns table
CREATE TABLE IF NOT EXISTS promotional_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_es TEXT,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('seasonal', 'flash_sale', 'clearance', 'new_customer', 'loyalty')),
  discount_percentage DECIMAL(5,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'retail', 'contractor', 'wholesale', 'new_customers')),
  banner_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign products table for targeted promotions
CREATE TABLE IF NOT EXISTS campaign_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage DECIMAL(5,2),
  special_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_valid ON coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_products_campaign_id ON campaign_products(campaign_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());
CREATE POLICY "Users can view their coupon usage" ON coupon_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can view active campaigns" ON promotional_campaigns FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());
CREATE POLICY "Anyone can view campaign products" ON campaign_products FOR SELECT USING (true);

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code VARCHAR(50),
  p_user_id UUID,
  p_order_total DECIMAL(10,2),
  p_user_type VARCHAR(20) DEFAULT 'retail'
)
RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  user_usage_count INTEGER;
  discount_amount DECIMAL(10,2);
  result JSON;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = p_coupon_code
    AND is_active = true
    AND valid_from <= NOW()
    AND valid_until >= NOW();

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'invalid_code');
  END IF;

  -- Check usage limits
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
    RETURN json_build_object('valid', false, 'error', 'usage_limit_exceeded');
  END IF;

  -- Check user usage limit
  SELECT COUNT(*) INTO user_usage_count
  FROM coupon_usage
  WHERE coupon_id = coupon_record.id AND user_id = p_user_id;

  IF user_usage_count >= coupon_record.user_usage_limit THEN
    RETURN json_build_object('valid', false, 'error', 'user_limit_exceeded');
  END IF;

  -- Check minimum order amount
  IF p_order_total < coupon_record.minimum_order_amount THEN
    RETURN json_build_object('valid', false, 'error', 'minimum_order_not_met', 'minimum_amount', coupon_record.minimum_order_amount);
  END IF;

  -- Calculate discount amount
  IF coupon_record.discount_type = 'percentage' THEN
    discount_amount := p_order_total * (coupon_record.discount_value / 100);
    IF coupon_record.maximum_discount_amount IS NOT NULL THEN
      discount_amount := LEAST(discount_amount, coupon_record.maximum_discount_amount);
    END IF;
  ELSIF coupon_record.discount_type = 'fixed_amount' THEN
    discount_amount := coupon_record.discount_value;
  ELSE
    discount_amount := 0; -- free_shipping handled separately
  END IF;

  -- Return success with discount details
  RETURN json_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'discount_type', coupon_record.discount_type,
    'discount_amount', discount_amount,
    'free_shipping', coupon_record.discount_type = 'free_shipping'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to apply coupon usage
CREATE OR REPLACE FUNCTION apply_coupon_usage(
  p_coupon_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
  -- Record coupon usage
  INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
  VALUES (p_coupon_id, p_user_id, p_order_id, p_discount_amount);

  -- Update coupon usage count
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample coupons
INSERT INTO coupons (code, name_en, name_es, description_en, description_es, discount_type, discount_value, minimum_order_amount, valid_from, valid_until, usage_limit) VALUES
('WELCOME10', 'Welcome 10% Off', 'Bienvenido 10% Descuento', 'Get 10% off your first order', 'Obtén 10% de descuento en tu primer pedido', 'percentage', 10.00, 50.00, NOW(), NOW() + INTERVAL '1 year', 1000),
('CONTRACTOR15', 'Contractor Special', 'Especial Contratista', '15% off for verified contractors', '15% de descuento para contratistas verificados', 'percentage', 15.00, 100.00, NOW(), NOW() + INTERVAL '6 months', 500),
('FREESHIP', 'Free Shipping', 'Envío Gratis', 'Free shipping on orders over $75', 'Envío gratis en pedidos mayores a $75', 'free_shipping', 0.00, 75.00, NOW(), NOW() + INTERVAL '3 months', NULL),
('SPRING25', 'Spring Sale', 'Venta de Primavera', '$25 off orders over $200', '$25 de descuento en pedidos mayores a $200', 'fixed_amount', 25.00, 200.00, NOW(), NOW() + INTERVAL '2 months', 200);

-- Insert sample promotional campaigns
INSERT INTO promotional_campaigns (name_en, name_es, description_en, description_es, campaign_type, discount_percentage, start_date, end_date, target_audience) VALUES
('Spring Landscaping Sale', 'Venta de Paisajismo de Primavera', 'Up to 20% off landscaping materials', 'Hasta 20% de descuento en materiales de paisajismo', 'seasonal', 20.00, NOW(), NOW() + INTERVAL '2 months', 'all'),
('Contractor Flash Sale', 'Venta Relámpago para Contratistas', 'Limited time 25% off for contractors', 'Tiempo limitado 25% de descuento para contratistas', 'flash_sale', 25.00, NOW(), NOW() + INTERVAL '1 week', 'contractor'),
('New Customer Special', 'Especial Cliente Nuevo', '15% off for first-time customers', '15% de descuento para clientes primerizos', 'new_customer', 15.00, NOW(), NOW() + INTERVAL '6 months', 'new_customers');
