-- Insert geographic zones
INSERT INTO geographic_zones (name, description, zip_codes, is_active) VALUES
('Las Vegas Metro', 'Las Vegas metropolitan area with standard delivery', ARRAY['89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110', '89111', '89112', '89113', '89114', '89115', '89116', '89117', '89118', '89119', '89120', '89121', '89122', '89123', '89124', '89125', '89126', '89127', '89128', '89129', '89130', '89131', '89132', '89133', '89134', '89135', '89136', '89137', '89138', '89139', '89140', '89141', '89142', '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89150', '89151', '89152', '89153', '89154', '89155', '89156', '89157', '89158', '89159', '89160', '89161', '89162', '89163', '89164', '89165', '89166', '89169', '89170', '89173', '89177', '89178', '89179', '89183', '89191', '89193'], true),
('Outside Las Vegas', 'Areas outside Las Vegas metro with special delivery requirements', ARRAY['%'], true);

-- Insert main categories
INSERT INTO categories (name, description, slug, is_active, sort_order) VALUES
('Hardscape Materials', 'Pavers, blocks, stones, and other hardscape materials', 'hardscape-materials', true, 1),
('Landscape Supplies', 'Mulch, soil, gravel, and other landscape materials', 'landscape-supplies', true, 2),
('Tools & Equipment', 'Garden tools, irrigation, and equipment', 'tools-equipment', true, 3),
('Outdoor Living', 'Fire pits, outdoor furniture, and accessories', 'outdoor-living', true, 4);

-- Insert hardscape subcategories
INSERT INTO categories (name, description, slug, parent_id, is_active, sort_order) VALUES
('Pavers', 'Concrete and natural stone pavers', 'pavers', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 1),
('Retaining Wall Blocks', 'Blocks for retaining walls and garden walls', 'retaining-wall-blocks', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 2),
('Natural Stone', 'Flagstone, boulders, and decorative stone', 'natural-stone', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 3),
('Edging & Borders', 'Landscape edging and border materials', 'edging-borders', (SELECT id FROM categories WHERE slug = 'hardscape-materials'), true, 4);

-- Insert sample hardscape products
INSERT INTO products (name, description, short_description, sku, price, category_id, brand, tags, images, is_active, is_featured, stock_quantity, weight, dimensions) VALUES
('Belgard Holland Stone Paver', 'Classic rectangular paver perfect for patios, walkways, and driveways. Available in multiple colors with a smooth finish.', 'Classic rectangular paver for patios and walkways', 'BEL-HOL-001', 2.85, (SELECT id FROM categories WHERE slug = 'pavers'), 'Belgard', ARRAY['paver', 'concrete', 'driveway', 'patio'], ARRAY['/images/belgard-holland-stone.jpg'], true, true, 500, 4.2, '{"length": 7.87, "width": 3.94, "height": 2.36, "unit": "inches"}'),

('Pavestone RumbleStone Block', 'Versatile concrete block perfect for retaining walls, fire pits, and outdoor kitchens. Tumbled finish for natural appearance.', 'Versatile concrete block for walls and fire pits', 'PAV-RUM-001', 3.45, (SELECT id FROM categories WHERE slug = 'retaining-wall-blocks'), 'Pavestone', ARRAY['block', 'retaining wall', 'fire pit', 'concrete'], ARRAY['/images/pavestone-rumblestone.jpg'], true, true, 300, 35.0, '{"length": 11.5, "width": 7, "height": 4, "unit": "inches"}'),

('Arizona Flagstone', 'Natural Arizona flagstone perfect for patios, walkways, and water features. Each piece is unique with beautiful color variations.', 'Natural flagstone for patios and walkways', 'NAT-FLAG-001', 8.50, (SELECT id FROM categories WHERE slug = 'natural-stone'), 'Natural Stone Supply', ARRAY['flagstone', 'natural', 'patio', 'walkway'], ARRAY['/images/arizona-flagstone.jpg'], true, true, 150, 25.0, '{"length": 24, "width": 18, "height": 1.5, "unit": "inches"}'),

('Concrete Landscape Edging', 'Durable concrete edging for clean landscape borders. Easy to install and maintain.', 'Concrete edging for landscape borders', 'CON-EDGE-001', 4.25, (SELECT id FROM categories WHERE slug = 'edging-borders'), 'Border Solutions', ARRAY['edging', 'concrete', 'border', 'landscape'], ARRAY['/images/concrete-edging.jpg'], true, false, 200, 8.5, '{"length": 24, "width": 4, "height": 3, "unit": "inches"}'),

('Belgard Mega-Arbel Paver', 'Large format paver with natural stone texture. Perfect for modern outdoor spaces and pool decks.', 'Large format paver with stone texture', 'BEL-MEG-001', 12.95, (SELECT id FROM categories WHERE slug = 'pavers'), 'Belgard', ARRAY['paver', 'large format', 'pool deck', 'modern'], ARRAY['/images/belgard-mega-arbel.jpg'], true, true, 100, 28.5, '{"length": 21.65, "width": 16.22, "height": 2.36, "unit": "inches"}');

-- Insert hardscape product details
INSERT INTO hardscape_products (product_id, requires_pallet, pallet_fee, pieces_per_pallet, coverage_per_piece, weight_per_piece, installation_difficulty, material_type, color_variations, texture) VALUES
((SELECT id FROM products WHERE sku = 'BEL-HOL-001'), true, 25.00, 480, 0.22, 4.2, 'easy', 'concrete', ARRAY['charcoal', 'red', 'tan', 'gray'], 'smooth'),
((SELECT id FROM products WHERE sku = 'PAV-RUM-001'), true, 25.00, 120, 0.56, 35.0, 'medium', 'concrete', ARRAY['gray', 'tan', 'red'], 'tumbled'),
((SELECT id FROM products WHERE sku = 'NAT-FLAG-001'), false, 0.00, 1, 3.0, 25.0, 'medium', 'natural stone', ARRAY['red', 'tan', 'gray', 'brown'], 'natural'),
((SELECT id FROM products WHERE sku = 'CON-EDGE-001'), true, 25.00, 60, 2.0, 8.5, 'easy', 'concrete', ARRAY['gray'], 'smooth'),
((SELECT id FROM products WHERE sku = 'BEL-MEG-001'), true, 25.00, 40, 2.44, 28.5, 'medium', 'concrete', ARRAY['charcoal', 'pewter', 'tan'], 'textured');

-- Insert product geographic restrictions (some products only available in Las Vegas Metro)
INSERT INTO product_geographic_restrictions (product_id, zone_id, is_allowed, restriction_message) VALUES
((SELECT id FROM products WHERE sku = 'NAT-FLAG-001'), (SELECT id FROM geographic_zones WHERE name = 'Outside Las Vegas'), false, 'Natural stone products are only available for delivery within the Las Vegas metropolitan area due to weight restrictions.');
