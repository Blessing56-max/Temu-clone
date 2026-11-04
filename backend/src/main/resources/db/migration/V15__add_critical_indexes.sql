-- V15: Add critical indexes for performance

-- Speeds up the admin order dashboard
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Speeds up seller KYC lookups
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- Speeds up product search for active items
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(active, price);

-- Speeds up escrow queries for the wallet
CREATE INDEX IF NOT EXISTS idx_escrow_seller_status ON escrow_transactions(seller_id, status);