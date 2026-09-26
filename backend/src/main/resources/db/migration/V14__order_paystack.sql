-- V14: Paystack payment tracking on orders
ALTER TABLE orders ADD COLUMN paystack_reference VARCHAR(100);
ALTER TABLE orders ADD COLUMN paystack_authorization_url VARCHAR(500);
CREATE INDEX idx_orders_paystack_ref ON orders(paystack_reference);