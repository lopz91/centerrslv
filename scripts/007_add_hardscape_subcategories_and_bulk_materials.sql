-- Add Hardscape subcategories and update Bulk Materials structure

-- First, ensure Bulk Materials category exists
INSERT INTO categories (name, description, slug, is_active, sort_order) VALUES
('Bulk Materials', 'Bulk landscape materials sold by the yard or ton', 'bulk-materials', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Add Bulk Materials subcategories
INSERT INTO categories (name, description, slug, parent_id, is_active, sort_order) VALUES
('Bagged Rock', 'Pre-bagged decorative rock and gravel in various sizes', 'bagged-rock', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 1),
('Decorative Rock', 'Bulk decorative rock and stone materials', 'decorative-rock', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 2),
('Fines', 'Fine materials for base preparation and finishing', 'fines', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 3),
('Base Material', 'Road base, decomposed granite, and foundation materials', 'base-material', (SELECT id FROM categories WHERE slug = 'bulk-materials'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Add Hardscape subcategories
INSERT INTO categories (name, description, slug, parent_id, is_active, sort_order) VALUES
('Retaining Walls', 'Retaining wall blocks and systems', 'retaining-walls', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 1),
('45mm Pavers', 'Standard 45mm thickness pavers for pedestrian areas', '45mm-pavers', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 2),
('60mm Pavers', 'Heavy-duty 60mm thickness pavers for driveways and high-traffic areas', '60mm-pavers', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 3),
('Step Stones', 'Natural and manufactured stepping stones', 'step-stones', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Add sample products for new Bulk Materials subcategories
INSERT INTO products (name, description, short_description, sku, price, category_id, brand, tags, images, is_active, is_featured, stock_quantity, weight, dimensions) VALUES

-- Bagged Rock products
('River Rock 3/4" - 50lb Bag', 'Natural river rock in convenient 50lb bags. Perfect for drainage, pathways, and decorative applications.', 'Natural river rock in 50lb bags', 'BULK-BAG-RR34', 6.95, (SELECT id FROM categories WHERE slug = 'bagged-rock'), 'Desert Stone Supply', ARRAY['river rock', 'bagged', 'drainage', 'decorative'], ARRAY['/images/river-rock-bagged.jpg'], true, true, 200, 50.0, '{"length": 24, "width": 16, "height": 4, "unit": "inches"}'),

('Lava Rock - 40lb Bag', 'Lightweight volcanic rock for landscaping and drainage. Natural red color adds visual interest to garden beds.', 'Lightweight lava rock in 40lb bags', 'BULK-BAG-LAVA', 8.50, (SELECT id FROM categories WHERE slug = 'bagged-rock'), 'Volcanic Materials', ARRAY['lava rock', 'lightweight', 'volcanic', 'red'], ARRAY['/images/lava-rock-bagged.jpg'], true, false, 150, 40.0, '{"length": 24, "width": 16, "height": 4, "unit": "inches"}'),

-- Decorative Rock products
('Desert Gold Decomposed Granite', 'Premium decomposed granite with golden color. Excellent for pathways, patios, and xeriscaping. Sold per cubic yard.', 'Golden decomposed granite per cubic yard', 'BULK-DEC-DG-GOLD', 45.00, (SELECT id FROM categories WHERE slug = 'decorative-rock'), 'Desert Aggregates', ARRAY['decomposed granite', 'gold', 'pathway', 'xeriscape'], ARRAY['/images/dg-desert-gold.jpg'], true, true, 50, 2700.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Red Rock Boulders - Large', 'Natural red sandstone boulders for accent landscaping. Each boulder is unique. Price per ton.', 'Natural red sandstone boulders per ton', 'BULK-DEC-BOULDER-RED', 185.00, (SELECT id FROM categories WHERE slug = 'decorative-rock'), 'Stone Quarry Co', ARRAY['boulders', 'red rock', 'sandstone', 'accent'], ARRAY['/images/red-rock-boulders.jpg'], true, true, 25, 4000.0, '{"diameter": 24, "height": 18, "unit": "inches"}'),

-- Fines products
('Decomposed Granite Fines', 'Fine decomposed granite for pathway stabilization and finishing. Creates smooth, compactable surface.', 'DG fines for pathway finishing', 'BULK-FINES-DG', 38.00, (SELECT id FROM categories WHERE slug = 'fines'), 'Desert Aggregates', ARRAY['fines', 'decomposed granite', 'pathway', 'stabilizer'], ARRAY['/images/dg-fines.jpg'], true, true, 75, 2500.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Crusher Fines', 'Fine crushed rock material for base preparation and compaction. Excellent binding properties.', 'Crusher fines for base preparation', 'BULK-FINES-CRUSH', 32.00, (SELECT id FROM categories WHERE slug = 'fines'), 'Construction Materials Inc', ARRAY['fines', 'crusher', 'base', 'compaction'], ARRAY['/images/crusher-fines.jpg'], true, false, 60, 2600.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

-- Base Material products
('Class II Road Base', 'Compactable road base material for driveways, walkways, and foundation preparation. Sold per cubic yard.', 'Compactable road base per cubic yard', 'BULK-BASE-CLASS2', 28.00, (SELECT id FROM categories WHERE slug = 'base-material'), 'Construction Materials Inc', ARRAY['road base', 'compactable', 'foundation', 'driveway'], ARRAY['/images/class2-road-base.jpg'], true, true, 100, 2800.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

('Crushed Concrete Base', 'Recycled crushed concrete for eco-friendly base applications. Excellent drainage and compaction. Sold per cubic yard.', 'Recycled crushed concrete base per cubic yard', 'BULK-BASE-CONCRETE', 22.00, (SELECT id FROM categories WHERE slug = 'base-material'), 'EcoBase Materials', ARRAY['crushed concrete', 'recycled', 'eco-friendly', 'base'], ARRAY['/images/crushed-concrete-base.jpg'], true, false, 75, 2600.0, '{"length": 36, "width": 36, "height": 36, "unit": "inches"}'),

-- Hardscape subcategory products
-- Retaining Walls
('Belgard Anchor Diamond Block', 'Versatile retaining wall block system for walls up to 3 feet high. Interlocking design for easy installation.', 'Belgard retaining wall blocks', 'HRD-RET-ANCHOR', 3.25, (SELECT id FROM categories WHERE slug = 'retaining-walls'), 'Belgard', ARRAY['retaining wall', 'belgard', 'anchor', 'interlocking'], ARRAY['/images/belgard-anchor-diamond.jpg'], true, true, 400, 35.0, '{"length": 12, "width": 8, "height": 4, "unit": "inches"}'),

('Allan Block Classic', 'Heavy-duty retaining wall system for commercial and residential applications. Engineered for stability.', 'Allan Block retaining wall system', 'HRD-RET-ALLAN', 4.50, (SELECT id FROM categories WHERE slug = 'retaining-walls'), 'Allan Block', ARRAY['retaining wall', 'allan block', 'heavy duty', 'engineered'], ARRAY['/images/allan-block-classic.jpg'], true, false, 200, 80.0, '{"length": 18, "width": 12, "height": 8, "unit": "inches"}'),

-- 45mm Pavers
('Belgard Holland Stone 45mm', 'Classic concrete paver in 45mm thickness. Perfect for patios, walkways, and pool decks.', 'Belgard 45mm Holland Stone pavers', 'HRD-45MM-HOLLAND', 2.85, (SELECT id FROM categories WHERE slug = '45mm-pavers'), 'Belgard', ARRAY['paver', '45mm', 'holland stone', 'concrete'], ARRAY['/images/belgard-holland-45mm.jpg'], true, true, 600, 8.5, '{"length": 8, "width": 4, "height": 1.77, "unit": "inches"}'),

('Tremron Sierra Stone 45mm', 'Textured concrete paver with natural stone appearance. Available in multiple colors.', 'Tremron 45mm Sierra Stone pavers', 'HRD-45MM-SIERRA', 3.15, (SELECT id FROM categories WHERE slug = '45mm-pavers'), 'Tremron', ARRAY['paver', '45mm', 'sierra stone', 'textured'], ARRAY['/images/tremron-sierra-45mm.jpg'], true, true, 450, 9.2, '{"length": 9, "width": 6, "height": 1.77, "unit": "inches"}'),

-- 60mm Pavers
('Belgard Mega-Arbel 60mm', 'Large format paver in 60mm thickness for driveways and commercial applications.', 'Belgard 60mm Mega-Arbel pavers', 'HRD-60MM-ARBEL', 4.95, (SELECT id FROM categories WHERE slug = '60mm-pavers'), 'Belgard', ARRAY['paver', '60mm', 'mega arbel', 'driveway'], ARRAY['/images/belgard-arbel-60mm.jpg'], true, true, 300, 15.8, '{"length": 16, "width": 24, "height": 2.36, "unit": "inches"}'),

('Tremron Stonegate 60mm', 'Premium interlocking paver designed for heavy traffic areas. Superior strength and durability.', 'Tremron 60mm Stonegate pavers', 'HRD-60MM-STONEGATE', 5.25, (SELECT id FROM categories WHERE slug = '60mm-pavers'), 'Tremron', ARRAY['paver', '60mm', 'stonegate', 'heavy traffic'], ARRAY['/images/tremron-stonegate-60mm.jpg'], true, false, 250, 16.5, '{"length": 12, "width": 8, "height": 2.36, "unit": "inches"}'),

-- Step Stones
('Natural Flagstone Steps', 'Natural flagstone stepping stones in irregular shapes. Perfect for garden pathways and water features.', 'Natural flagstone stepping stones', 'HRD-STEP-FLAG', 12.50, (SELECT id FROM categories WHERE slug = 'step-stones'), 'Natural Stone Co', ARRAY['step stone', 'flagstone', 'natural', 'irregular'], ARRAY['/images/flagstone-steps.jpg'], true, true, 100, 25.0, '{"diameter": 18, "height": 2, "unit": "inches"}'),

('Concrete Round Steppers', 'Manufactured concrete stepping stones in round format. Consistent size and color for formal pathways.', 'Concrete round stepping stones', 'HRD-STEP-ROUND', 8.95, (SELECT id FROM categories WHERE slug = 'step-stones'), 'Concrete Products Inc', ARRAY['step stone', 'concrete', 'round', 'manufactured'], ARRAY['/images/concrete-round-steppers.jpg'], true, true, 150, 18.0, '{"diameter": 16, "height": 1.5, "unit": "inches"}')

ON CONFLICT (sku) DO NOTHING;
