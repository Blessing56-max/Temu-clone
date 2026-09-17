-- Widen numeric columns to handle larger values.
-- Old: NUMERIC(12,2) = max 9,999,999,999.99
-- New: NUMERIC(18,2) = max 9,999,999,999,999,999.99

ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(18,2);
ALTER TABLE products ALTER COLUMN discount_price TYPE NUMERIC(18,2);

ALTER TABLE orders ALTER COLUMN subtotal TYPE NUMERIC(18,2);
ALTER TABLE orders ALTER COLUMN delivery_fee TYPE NUMERIC(18,2);
ALTER TABLE orders ALTER COLUMN total TYPE NUMERIC(18,2);

ALTER TABLE order_items ALTER COLUMN unit_price TYPE NUMERIC(18,2);
ALTER TABLE order_items ALTER COLUMN line_total TYPE NUMERIC(18,2);