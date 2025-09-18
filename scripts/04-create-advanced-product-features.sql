-- Create product analytics table for tracking performance
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  cart_additions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- Create inventory alerts table for automated reorder management
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder_point', 'overstock')),
  threshold_value INTEGER,
  current_stock INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product bundles table for cross-selling
CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_es TEXT,
  bundle_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bundle items table
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product recommendations table for AI-powered suggestions
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('frequently_bought_together', 'similar_products', 'complementary', 'upsell')),
  confidence_score DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, recommended_product_id, recommendation_type)
);

-- Create product variants table for size/color variations
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  variant_value VARCHAR(255) NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sku_suffix VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_date ON product_analytics(product_id, date);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_active ON inventory_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_parent_id ON product_variants(parent_product_id);

-- Enable RLS
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for most tables)
CREATE POLICY "Anyone can view product analytics" ON product_analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can view active bundles" ON product_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view bundle items" ON bundle_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view active recommendations" ON product_recommendations FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active variants" ON product_variants FOR SELECT USING (is_active = true);

-- Admin-only policies for inventory alerts
CREATE POLICY "Admins can manage inventory alerts" ON inventory_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND contractor_tier = 'elite')
);

-- Function to automatically create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for low stock (less than 10% of initial stock or below 5 units)
  IF NEW.stock_quantity <= GREATEST(NEW.min_order_quantity * 2, 5) AND 
     NEW.stock_quantity > 0 THEN
    INSERT INTO inventory_alerts (product_id, alert_type, threshold_value, current_stock)
    VALUES (NEW.id, 'low_stock', GREATEST(NEW.min_order_quantity * 2, 5), NEW.stock_quantity)
    ON CONFLICT (product_id, alert_type) DO UPDATE SET
      current_stock = NEW.stock_quantity,
      last_triggered = NOW(),
      is_active = TRUE;
  END IF;

  -- Check for out of stock
  IF NEW.stock_quantity = 0 THEN
    INSERT INTO inventory_alerts (product_id, alert_type, threshold_value, current_stock)
    VALUES (NEW.id, 'out_of_stock', 0, 0)
    ON CONFLICT (product_id, alert_type) DO UPDATE SET
      current_stock = 0,
      last_triggered = NOW(),
      is_active = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory alerts
DROP TRIGGER IF EXISTS inventory_check_trigger ON products;
CREATE TRIGGER inventory_check_trigger
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_levels();

-- Function to update product analytics
CREATE OR REPLACE FUNCTION update_product_analytics(
  p_product_id UUID,
  p_event_type VARCHAR(50),
  p_revenue DECIMAL(10,2) DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_analytics (product_id, date, views, cart_additions, purchases, revenue)
  VALUES (
    p_product_id,
    CURRENT_DATE,
    CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'cart_add' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'purchase' THEN 1 ELSE 0 END,
    p_revenue
  )
  ON CONFLICT (product_id, date) DO UPDATE SET
    views = product_analytics.views + CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
    cart_additions = product_analytics.cart_additions + CASE WHEN p_event_type = 'cart_add' THEN 1 ELSE 0 END,
    purchases = product_analytics.purchases + CASE WHEN p_event_type = 'purchase' THEN 1 ELSE 0 END,
    revenue = product_analytics.revenue + p_revenue,
    conversion_rate = CASE 
      WHEN product_analytics.views > 0 THEN 
        (product_analytics.purchases + CASE WHEN p_event_type = 'purchase' THEN 1 ELSE 0 END)::DECIMAL / product_analytics.views
      ELSE 0 
    END;
END;
$$ LANGUAGE plpgsql;
