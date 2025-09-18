-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  account_type TEXT DEFAULT 'retail' CHECK (account_type IN ('retail', 'contractor', 'wholesale')),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_es TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(10,2) NOT NULL,
  contractor_price DECIMAL(10,2),
  wholesale_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  weight DECIMAL(8,2),
  dimensions TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  requires_delivery BOOLEAN DEFAULT false,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  -- Added hardscape category support and pallet fee
  is_hardscape BOOLEAN DEFAULT false,
  pallet_fee DECIMAL(10,2) DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zip_code_restrictions table for location-based availability
CREATE TABLE IF NOT EXISTS public.zip_code_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  zip_code TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  delivery_fee_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_carts table
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_address JSONB,
  billing_address JSONB,
  notes TEXT,
  zoho_books_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added geographic zones table for better zone management
CREATE TABLE IF NOT EXISTS public.geographic_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  zip_codes TEXT[] DEFAULT '{}',
  is_default_zone BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added product geographic restrictions table
CREATE TABLE IF NOT EXISTS public.product_geographic_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.geographic_zones(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  delivery_fee_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, zone_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zip_code_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_geographic_restrictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for categories (public read access)
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);

-- Create RLS policies for products (public read access)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

-- Create RLS policies for zip_code_restrictions (public read access)
CREATE POLICY "Anyone can view zip code restrictions" ON public.zip_code_restrictions FOR SELECT USING (true);

-- Create RLS policies for shopping_carts
CREATE POLICY "Users can manage their own cart" ON public.shopping_carts FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Create RLS policies for geographic zones (public read access)
CREATE POLICY "Anyone can view geographic zones" ON public.geographic_zones FOR SELECT USING (true);

-- Create RLS policies for product geographic restrictions (public read access)
CREATE POLICY "Anyone can view product geographic restrictions" ON public.product_geographic_restrictions FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_zip_code_restrictions_product_id ON public.zip_code_restrictions(product_id);
CREATE INDEX IF NOT EXISTS idx_zip_code_restrictions_zip_code ON public.zip_code_restrictions(zip_code);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON public.shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_is_hardscape ON public.products(is_hardscape);
CREATE INDEX IF NOT EXISTS idx_product_geographic_restrictions_product_id ON public.product_geographic_restrictions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_geographic_restrictions_zone_id ON public.product_geographic_restrictions(zone_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON public.shopping_carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Added function to automatically calculate pallet fees for hardscape items
CREATE OR REPLACE FUNCTION public.calculate_pallet_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Automatically set pallet fee to $25 for hardscape items
  IF NEW.is_hardscape = true AND (NEW.pallet_fee IS NULL OR NEW.pallet_fee = 0) THEN
    NEW.pallet_fee = 25.00;
  ELSIF NEW.is_hardscape = false THEN
    NEW.pallet_fee = 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic pallet fee calculation
DROP TRIGGER IF EXISTS calculate_pallet_fee_trigger ON public.products;
CREATE TRIGGER calculate_pallet_fee_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_pallet_fee();

-- Insert default geographic zones
INSERT INTO public.geographic_zones (name, description, zip_codes, is_default_zone) VALUES
('Las Vegas Metro', 'Las Vegas metropolitan area with full product availability', 
 ARRAY['89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110', 
       '89111', '89112', '89113', '89114', '89115', '89116', '89117', '89118', '89119', '89120',
       '89121', '89122', '89123', '89124', '89125', '89126', '89127', '89128', '89129', '89130',
       '89131', '89132', '89133', '89134', '89135', '89136', '89137', '89138', '89139', '89140',
       '89141', '89142', '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89150',
       '89151', '89152', '89153', '89154', '89155', '89156', '89157', '89158', '89159', '89160',
       '89161', '89162', '89163', '89164', '89165', '89166', '89169', '89170', '89173', '89177',
       '89178', '89179', '89183', '89191', '89193', '89195', '89199'], 
 true),
('Outside Las Vegas', 'Areas outside Las Vegas with restricted product availability', 
 ARRAY[], false)
ON CONFLICT DO NOTHING;
