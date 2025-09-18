-- Insert sample categories
INSERT INTO public.categories (name_en, name_es, slug, description_en, description_es, sort_order) VALUES
('Irrigation', 'Riego', 'irrigation', 'Complete irrigation systems and components', 'Sistemas de riego completos y componentes', 1),
('Landscape Lighting', 'Iluminación de Paisaje', 'landscape-lighting', 'Professional landscape lighting solutions', 'Soluciones profesionales de iluminación de paisaje', 2),
('Hardscape Materials', 'Materiales de Paisajismo Duro', 'hardscape-materials', 'Pavers, stones, and hardscape supplies', 'Adoquines, piedras y suministros de paisajismo duro', 3),
-- Removed Plants & Trees category
('Tools & Equipment', 'Herramientas y Equipos', 'tools-equipment', 'Professional landscaping tools and equipment', 'Herramientas y equipos profesionales de paisajismo', 4),
('Fertilizers & Chemicals', 'Fertilizantes y Químicos', 'fertilizers-chemicals', 'Plant nutrition and pest control products', 'Productos de nutrición vegetal y control de plagas', 5);

-- Insert sample products
INSERT INTO public.products (sku, name_en, name_es, description_en, description_es, category_id, price, contractor_price, wholesale_price, stock_quantity, images, tags) VALUES
('IRR-001', 'Hunter Pro-Spray Sprinkler Head', 'Aspersor Hunter Pro-Spray', 'Professional grade pop-up sprinkler head with adjustable spray pattern', 'Aspersor emergente de grado profesional con patrón de rociado ajustable', (SELECT id FROM public.categories WHERE slug = 'irrigation'), 12.99, 9.99, 7.99, 150, ARRAY['/images/products/hunter-pro-spray.jpg'], ARRAY['irrigation', 'sprinkler', 'hunter']),
('IRR-002', 'Rain Bird 5000 Series Rotor', 'Rotor Rain Bird Serie 5000', 'Heavy-duty rotor sprinkler for large area coverage', 'Aspersor rotor resistente para cobertura de áreas grandes', (SELECT id FROM public.categories WHERE slug = 'irrigation'), 45.99, 35.99, 28.99, 75, ARRAY['/images/products/rainbird-5000.jpg'], ARRAY['irrigation', 'rotor', 'rainbird']),
('LGT-001', 'Kichler LED Path Light', 'Luz de Sendero LED Kichler', 'Energy-efficient LED path lighting fixture', 'Luminaria LED de sendero de bajo consumo energético', (SELECT id FROM public.categories WHERE slug = 'landscape-lighting'), 89.99, 69.99, 55.99, 50, ARRAY['/images/products/kichler-path-light.jpg'], ARRAY['lighting', 'led', 'path', 'kichler']),
('HRD-001', 'Belgard Holland Stone Paver', 'Adoquín Belgard Holland Stone', 'Classic concrete paver for driveways and walkways', 'Adoquín de concreto clásico para entradas y senderos', (SELECT id FROM public.categories WHERE slug = 'hardscape-materials'), 2.99, 2.49, 1.99, 500, ARRAY['/images/products/belgard-holland-stone.jpg'], ARRAY['paver', 'concrete', 'belgard', 'hardscape']),
-- Removed Desert Willow Tree product (PLT-001)
('TOL-001', 'Stihl MS 250 Chainsaw', 'Motosierra Stihl MS 250', 'Professional chainsaw for tree trimming and removal', 'Motosierra profesional para poda y remoción de árboles', (SELECT id FROM public.categories WHERE slug = 'tools-equipment'), 349.99, 299.99, 249.99, 15, ARRAY['/images/products/stihl-ms250.jpg'], ARRAY['chainsaw', 'stihl', 'professional', 'tree-care']);

-- Insert zip code restrictions (some products only available in certain areas)
INSERT INTO public.zip_code_restrictions (product_id, zip_code, is_available, delivery_fee_override) VALUES
-- Removed all PLT-001 zip code restrictions
((SELECT id FROM public.products WHERE sku = 'HRD-001'), '89101', true, 15.00),
((SELECT id FROM public.products WHERE sku = 'HRD-001'), '89102', true, 15.00),
((SELECT id FROM public.products WHERE sku = 'HRD-001'), '89103', true, 20.00),
((SELECT id FROM public.products WHERE sku = 'TOL-001'), '89101', true, 0.00),
((SELECT id FROM public.products WHERE sku = 'TOL-001'), '89102', true, 0.00),
((SELECT id FROM public.products WHERE sku = 'TOL-001'), '89103', true, 0.00),
((SELECT id FROM public.products WHERE sku = 'TOL-001'), '89104', true, 0.00),
((SELECT id FROM public.products WHERE sku = 'TOL-001'), '89105', true, 0.00);
