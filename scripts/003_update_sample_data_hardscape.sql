-- Update sample products to include hardscape categories and pallet fees
UPDATE public.products 
SET is_hardscape = true, pallet_fee = 25.00 
WHERE sku IN ('HRD-001');

-- Insert additional hardscape products
INSERT INTO public.products (sku, name_en, name_es, description_en, description_es, category_id, price, contractor_price, wholesale_price, stock_quantity, is_hardscape, pallet_fee, images, tags) VALUES
('HRD-002', 'Belgard Mega-Arbel Paver', 'Adoquín Belgard Mega-Arbel', 'Large format concrete paver with natural stone texture', 'Adoquín de concreto de gran formato con textura de piedra natural', (SELECT id FROM public.categories WHERE slug = 'hardscape-materials'), 4.99, 3.99, 3.49, 300, true, 25.00, ARRAY['/images/products/belgard-mega-arbel.jpg'], ARRAY['paver', 'concrete', 'belgard', 'hardscape', 'large-format']),
('HRD-003', 'Decomposed Granite - Gold', 'Granito Descompuesto - Dorado', 'Natural decomposed granite for pathways and landscaping', 'Granito descompuesto natural para senderos y paisajismo', (SELECT id FROM public.categories WHERE slug = 'hardscape-materials'), 45.00, 38.00, 32.00, 100, true, 25.00, ARRAY['/images/products/decomposed-granite-gold.jpg'], ARRAY['granite', 'pathway', 'natural', 'hardscape']),
('HRD-004', 'River Rock - 3/4 inch', 'Piedra de Río - 3/4 pulgada', 'Natural river rock for drainage and decorative applications', 'Piedra de río natural para drenaje y aplicaciones decorativas', (SELECT id FROM public.categories WHERE slug = 'hardscape-materials'), 55.00, 45.00, 38.00, 80, true, 25.00, ARRAY['/images/products/river-rock-34.jpg'], ARRAY['rock', 'drainage', 'decorative', 'hardscape']);

-- Set up geographic restrictions for new hardscape products
-- Las Vegas Metro gets all products
INSERT INTO public.product_geographic_restrictions (product_id, zone_id, is_available, delivery_fee_override)
SELECT p.id, z.id, true, 0.00
FROM public.products p
CROSS JOIN public.geographic_zones z
WHERE p.sku IN ('HRD-002', 'HRD-003', 'HRD-004') 
AND z.name = 'Las Vegas Metro'
ON CONFLICT (product_id, zone_id) DO NOTHING;

-- Outside Las Vegas gets limited hardscape availability (admin can modify)
INSERT INTO public.product_geographic_restrictions (product_id, zone_id, is_available, delivery_fee_override)
SELECT p.id, z.id, false, 50.00
FROM public.products p
CROSS JOIN public.geographic_zones z
WHERE p.sku IN ('HRD-002', 'HRD-003', 'HRD-004') 
AND z.name = 'Outside Las Vegas'
ON CONFLICT (product_id, zone_id) DO NOTHING;
