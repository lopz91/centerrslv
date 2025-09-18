-- Add Artificial Turf and Bulk Materials categories with subcategories

-- Insert Artificial Turf as a main category
INSERT INTO categories (name, description, slug, is_active, sort_order) VALUES
('Artificial Turf', 'High-quality synthetic grass and turf solutions for residential and commercial applications', 'artificial-turf', true, 5);

-- Insert Bulk Materials as a main category
INSERT INTO categories (name, description, slug, is_active, sort_order) VALUES
('Bulk Materials', 'Bulk landscape materials sold by the yard or ton', 'bulk-materials', true, 6);

-- Insert Bulk Materials subcategories
INSERT INTO categories (name, description, slug, parent_id, is_active, sort_order) VALUES
('Bagged Rock', 'Pre-bagged decorative rock and gravel in various sizes', 'bagged-rock', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 1),
('Decorative Rock', 'Bulk decorative rock and stone materials', 'decorative-rock', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 2),
('Base Materials', 'Road base, decomposed granite, and foundation materials', 'base-materials', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 3),
('Mulch and Compost', 'Organic mulch, bark, and compost materials', 'mulch-compost', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 4);

-- Insert sample Artificial Turf products
INSERT INTO products (name, description, short_description, sku, price, category_id, brand, tags, images, is_active, is_featured, stock_quantity, weight, dimensions) VALUES
('Premium Synthetic Grass - 15ft Roll', 'High-quality artificial turf with realistic appearance and feel. Perfect for residential lawns, pet areas, and commercial applications.', 'Premium synthetic grass for lawns and landscapes', 'TURF-PREM-15', 8.95, (SELECT id FROM categories WHERE slug = 'artificial-turf'), 'TurfPro', ARRAY['artificial turf', 'synthetic grass', 'lawn', 'pet friendly'], ARRAY['/images/premium-synthetic-grass.jpg'], true, true, 25, 2.5, '{"length": 180, "width": 15, "height": 1.5, "unit": "feet"}'),

('Sports Turf - Multi-Purpose', 'Durable synthetic turf designed for sports applications and high-traffic areas. UV resistant and drainage backing.', 'Durable sports turf for high-traffic areas', 'TURF-SPORT-001', 12.50, (SELECT id FROM categories WHERE slug = 'artificial-turf'), 'SportsTurf Pro', ARRAY['sports turf', 'high traffic', 'durable', 'UV resistant'], ARRAY['/images/sports-turf-multipurpose.jpg'], true, false, 15, 3.2, '{"length": 180, "width": 12, "height": 2, "unit": "feet"}');

-- Insert sample Bulk Materials products
INSERT INTO products (name, description, short_description, sku, price, category_id, brand, tags, images, is_active, is_featured, stock_quantity, weight, dimensions) VALUES
-- Bagged Rock products
('River Rock 3/4" - 50lb Bag', 'Natural river rock in convenient 50lb bags. Perfect for drainage, pathways, and decorative applications.', 'Natural river rock in 50lb bags', 'BULK-BAG-RR34', 6.95, (SELECT id FROM categories WHERE slug = 'bagged-rock'), 'Desert Stone Supply', ARRAY['river rock', 'bagged', 'drainage', 'decorative'], ARRAY['/images/river-rock-bagged.jpg'], true, true, 200, 50.0, '{"length": 24, "width": 16, "height": 4, "unit": "inches"}'),

('Lava Rock - 40lb Bag', 'Lightweight volcanic rock for landscaping and drainage. Natural red color adds visual interest to garden beds.', 'Lightweight lava rock in 40lb bags', 'BULK-BAG-LAVA', 8.50, (SELECT id FROM categories WHERE slug = 'bagged-rock'), 'Volcanic Materials', ARRAY['lava rock', 'lightweight', 'volcanic', 'red'], ARRAY['/images/lava-rock-bagged.jpg'], true, false, 150, 40.0, '{"length": 24, "width": 16, "height": 4, "unit": "inches"}'),

-- Decorative Rock products (sold by cubic yard)
('Desert Gold Decomposed Granite', 'Premium decomposed granite with golden color. Excellent for pathways, patios, and xeriscaping. Sold per cubic yard.', 'Golden decomposed granite per cubic yard', 'BULK-DEC-DG-GOLD', 45.00, (SELECT id FROM categories WHERE slug = 'decorative-rock'), 'Desert Aggregates', ARRAY['decomposed granite', 'gold', 'pathway', 'xeriscape'], ARRAY['/images/dg-desert-gold.jpg'], true, true, 50, 2700.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Red Rock Boulders - Large', 'Natural red sandstone boulders for accent landscaping. Each boulder is unique. Price per ton.', 'Natural red sandstone boulders per ton', 'BULK-DEC-BOULDER-RED', 185.00, (SELECT id FROM categories WHERE slug = 'decorative-rock'), 'Stone Quarry Co', ARRAY['boulders', 'red rock', 'sandstone', 'accent'], ARRAY['/images/red-rock-boulders.jpg'], true, true, 25, 4000.0, '{"diameter": 24, "height": 18, "unit": "inches"}'),

-- Base Materials products
('Class II Road Base', 'Compactable road base material for driveways, walkways, and foundation preparation. Sold per cubic yard.', 'Compactable road base per cubic yard', 'BULK-BASE-CLASS2', 28.00, (SELECT id FROM categories WHERE slug = 'base-materials'), 'Construction Materials Inc', ARRAY['road base', 'compactable', 'foundation', 'driveway'], ARRAY['/images/class2-road-base.jpg'], true, true, 100, 2800.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Crushed Concrete Base', 'Recycled crushed concrete for eco-friendly base applications. Excellent drainage and compaction. Sold per cubic yard.', 'Recycled crushed concrete base per cubic yard', 'BULK-BASE-CONCRETE', 22.00, (SELECT id FROM categories WHERE slug = 'base-materials'), 'EcoBase Materials', ARRAY['crushed concrete', 'recycled', 'eco-friendly', 'base'], ARRAY['/images/crushed-concrete-base.jpg'], true, false, 75, 2600.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

-- Mulch and Compost products
('Premium Bark Mulch', 'Shredded bark mulch for moisture retention and weed suppression. Natural brown color. Sold per cubic yard.', 'Premium bark mulch per cubic yard', 'BULK-MULCH-BARK', 35.00, (SELECT id FROM categories WHERE slug = 'mulch-compost'), 'Organic Landscapes', ARRAY['bark mulch', 'organic', 'weed suppression', 'moisture retention'], ARRAY['/images/bark-mulch.jpg'], true, true, 60, 800.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Compost Blend - Organic', 'Rich organic compost blend perfect for soil amendment and garden beds. Nutrient-rich and well-aged. Sold per cubic yard.', 'Organic compost blend per cubic yard', 'BULK-COMPOST-ORG', 42.00, (SELECT id FROM categories WHERE slug = 'mulch-compost'), 'Green Earth Compost', ARRAY['compost', 'organic', 'soil amendment', 'nutrient rich'], ARRAY['/images/organic-compost.jpg'], true, true, 40, 1200.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}');
