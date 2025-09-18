-- Execute the artificial turf and bulk materials category additions
\i scripts/006_add_artificial_turf_and_bulk_materials.sql

-- Verify the categories were created
SELECT 
    c.name as category_name,
    c.slug,
    p.name as parent_name,
    c.sort_order,
    c.is_active
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.slug IN ('artificial-turf', 'bulk-materials', 'bagged-rock', 'decorative-rock', 'base-materials', 'mulch-compost')
ORDER BY c.sort_order;

-- Show product count by new categories
SELECT 
    c.name as category_name,
    COUNT(pr.id) as product_count
FROM categories c
LEFT JOIN products pr ON c.id = pr.category_id
WHERE c.slug IN ('artificial-turf', 'bulk-materials', 'bagged-rock', 'decorative-rock', 'base-materials', 'mulch-compost')
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;
