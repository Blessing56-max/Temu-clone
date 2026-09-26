-- V13: Seller KYC, escrow, withdrawals, rent payments

-- ============================================================
-- 1. Add KYC/rent columns to users
-- ============================================================
ALTER TABLE users ADD COLUMN kyc_status VARCHAR(20) NOT NULL DEFAULT 'NOT_APPLICABLE';
ALTER TABLE users ADD COLUMN rent_status VARCHAR(20) NOT NULL DEFAULT 'NOT_APPLICABLE';
ALTER TABLE users ADD COLUMN rent_paid_until TIMESTAMP;
ALTER TABLE users ADD COLUMN last_rent_paid_at TIMESTAMP;

CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_rent_status ON users(rent_status);

-- ============================================================
-- 2. seller_verifications — KYC data + Paystack recipient
-- ============================================================
CREATE TABLE seller_verifications (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    -- UNVERIFIED / PENDING / VERIFIED / REJECTED

    -- Identity
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    id_document_url VARCHAR(500),
    selfie_url VARCHAR(500),

    -- Business
    business_name VARCHAR(255),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    zip_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Bank (Paystack-verified)
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    account_number VARCHAR(20),
    account_name VARCHAR(255),
    paystack_recipient_code VARCHAR(100),

    -- Admin review
    rejection_reason VARCHAR(500),
    verified_at TIMESTAMP,
    reviewed_by BIGINT REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_verif_status ON seller_verifications(status);

-- ============================================================
-- 3. escrow_transactions — money held per order
-- ============================================================
CREATE TABLE escrow_transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id BIGINT NOT NULL REFERENCES users(id),
    buyer_id BIGINT NOT NULL REFERENCES users(id),

    amount NUMERIC(18,2) NOT NULL,
    commission NUMERIC(18,2) NOT NULL,
    seller_payout NUMERIC(18,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'HELD',
    -- HELD / RELEASED / REFUNDED / DISPUTED

    paystack_reference VARCHAR(100),
    held_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    refunded_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_order ON escrow_transactions(order_id);

-- ============================================================
-- 4. withdrawals — payouts to seller bank accounts
-- ============================================================
CREATE TABLE withdrawals (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES users(id),
    amount NUMERIC(18,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING / PROCESSING / COMPLETED / FAILED

    paystack_transfer_code VARCHAR(100),
    paystack_reference VARCHAR(100),
    failure_reason VARCHAR(500),

    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_withdrawals_seller ON withdrawals(seller_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- ============================================================
-- 5. rent_payments — monthly rent records
-- ============================================================
CREATE TABLE rent_payments (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES users(id),

    amount NUMERIC(18,2) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING / PAID / FAILED

    paystack_reference VARCHAR(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rent_payments_seller ON rent_payments(seller_id);
CREATE INDEX idx_rent_payments_status ON rent_payments(status);

-- ============================================================
-- 6. Set existing sellers to TRIAL (30-day grace)
-- ============================================================
UPDATE users
SET kyc_status = 'VERIFIED',
    rent_status = 'TRIAL',
    rent_paid_until = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE role = 'SELLER';

UPDATE users
SET kyc_status = 'NOT_APPLICABLE',
    rent_status = 'NOT_APPLICABLE'
WHERE role IN ('CUSTOMER', 'ADMIN');