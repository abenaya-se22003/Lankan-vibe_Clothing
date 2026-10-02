-- =============================================
-- V6: Update sample clothing products with multi-size and unavailable states
-- =============================================

UPDATE products 
SET size = 'XS, S, M, L, (XL), XXL', color = 'Ocean Blue, (Sunset Coral)' 
WHERE id = 1;

UPDATE products 
SET size = 'XS, S, M, (L), XL', color = 'Emerald Green, (Ivory Gold)' 
WHERE id = 2;

UPDATE products 
SET size = 'Free Size', color = 'Maroon & Gold, (Classic Navy)' 
WHERE id = 3;

UPDATE products 
SET size = 'XS, S, M, L, (XL), XXL', color = 'Off White, (Charcoal Black)' 
WHERE id = 4;

UPDATE products 
SET size = 'S, M, L, (XL), XXL', color = 'Sand Beige, (Olive)' 
WHERE id = 5;

UPDATE products 
SET size = 'XS, S, M, (L)', color = 'Sunset Coral, (Indigo)' 
WHERE id = 6;
