-- =============================================
-- V5: Expand size and color columns for multiple sizes and unavailable indicators
-- =============================================

ALTER TABLE products ALTER COLUMN size TYPE VARCHAR(255);
ALTER TABLE products ALTER COLUMN color TYPE VARCHAR(255);
