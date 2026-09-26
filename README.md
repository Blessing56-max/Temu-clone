# Kora Marketplace

**Fast and Easy Marketing** — a full-stack e-commerce marketplace with verified sellers, real escrow payments, and a full trust layer.

Built for NIIT MMS4. Independent academic project.

---

## Stack

- **Frontend:** React 18, Vite, Redux Toolkit, Tailwind CSS v4, Framer Motion
- **Backend:** Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, Hibernate, Flyway
- **Database:** PostgreSQL 15
- **Auth:** JWT (access + refresh tokens), BCrypt
- **Payments:** Paystack (sandbox — real API, real bank resolution, real transfers)
- **Testing:** JUnit 5, Mockito, Testcontainers

---
## What Works

### Buyers
Register with role picker, browse, live search + voice search, filter, cart, wishlist, Paystack inline checkout, escrow-protected payment, live order tracking timeline, notifications, product reviews, first-time onboarding quiz.

### Sellers
Separate seller registration, KYC verification (ID + selfie + business address + GPS + Paystack bank resolve), list/manage products, receive new-order notifications, mark PACKED → SHIPPED, wallet with escrow-held balance, request withdrawals to verified bank account, pay monthly rent.

### Admins
Platform stats, user management (role change, suspend), order fulfillment, KYC review queue (approve/reject), withdrawal approvals (fires Paystack Transfer), rent overview (locked sellers flagged), audit log.

### Trust & Compliance
- **KYC:** UNVERIFIED → PENDING → VERIFIED / REJECTED. Auto-verify if bank account name matches profile.
- **Escrow:** Buyer payment held until order DELIVERED. Then 85% to seller, 15% to Kora.
- **Withdrawals:** Seller requests, admin approves, Paystack Transfer fires. Min N5,000.
- **Rent:** 30-day trial → N10,000/month → 3-day grace → store LOCKED (products hidden).
- **Delete protection:** Sellers can't delete products if escrow is held.

### Accessibility
- WCAG 2.1 AA color contrast
- Every status badge has icon + text (colorblind-safe)
- Keyboard focus rings on all interactive elements
- Skip-to-main-content link
- Alt text on images
- Respects prefers-reduced-motion
- Icon buttons with hover tooltips

---
## Quick Start

### 1. Create the database
    createdb kora_db
    psql -U postgres -c "CREATE USER kora WITH PASSWORD 'kora_dev_password';"
    psql -U postgres -c "ALTER DATABASE kora_db OWNER TO kora;"

### 2. Run backend
    cd backend
    mvn spring-boot:run

Runs on http://localhost:8080. Flyway migrates schema. DataSeeder populates 6 users, 8 categories, 80+ products.

Swagger UI: http://localhost:8080/swagger-ui.html

Paystack keys: Set in backend/src/main/resources/application-dev.yml. Use sk_test_* and pk_test_* from https://dashboard.paystack.com (free signup, no business registration for test mode).

### 3. Run frontend
    cd frontend
    npm install
    npm run dev

Runs on http://localhost:5173.

---

## Demo Accounts

Password for all: Password123!

| Email | Role |
|---|---|
| customer@kora.test | Buyer |
| blessing@kora.test | Seller (KYC verified) |
| nathan@kora.test | Seller (KYC verified) |
| techhub@kora.test | Seller (KYC verified) |
| fashionhub@kora.test | Seller (KYC verified) |
| admin@kora.test | Admin |

---

## Team

- Adedayo Nathan — Backend, database, security, escrow, payments
- Adedayo Blessing — Frontend, UI/UX, seller experience

## License

Academic project. All rights reserved by the authors.