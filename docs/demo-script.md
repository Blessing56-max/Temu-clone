# Kora Demo Script

Five-minute walkthrough for the Phase 1 presentation.

## Setup (before class)

Two PowerShell windows:

**Window 1 — Backend**

    cd backend
    mvn spring-boot:run

Wait for: `Started KoraApplication`. Watch for `DataSeeder: seeded 6 users, 8 categories, 46 products.`

**Window 2 — Frontend**

    cd frontend
    npm run dev

Wait for: `Local: http://localhost:5173/`

**Two browser windows for the demo:**

- Window A — normal (buyer)
- Window B — incognito (seller)

## The Flow

### 1. Landing page — 30 seconds

Open http://localhost:5173.

- Hero with rotating 3D carousel of products
- Move the mouse — ripples follow the cursor
- Scroll down through: category tiles with real photos, trending products, flash deals section, seller spotlight, testimonials, FAQ

Say: *"This is a full marketplace. Products are real — pulled from our PostgreSQL database."*

### 2. Buyer journey — Window A — 2 minutes

1. Click **Get Started** then **Create account**
2. Register a fresh account: `demo@kora.test` / `Password123!`
3. Land on customer dashboard — shows products and recent orders
4. Browse products, click any product
5. Show the product detail page: image gallery, description, price, stock, reviews
6. Click **Add to cart**
7. Click the cart icon in the navbar → cart page shows the item
8. Click **Proceed to checkout** → fill in delivery details → **Place order**
9. On confirmation, click **Track order**

**THE MONEY SHOT:** the tracking timeline.

Show:

- Order placed — timestamped, with actor
- Payment confirmed — timestamped
- Packed, Shipped, Delivered — greyed out (next steps)

Say: *"This is the difference between our project and a basic shop. Every status change is a row in `order_status_history` — a real timeline, like Amazon. The buyer sees who did what and when."*

### 3. Seller journey — Window B — 2 minutes

1. Log in as `blessing@kora.test` / `Password123!`
2. Go to http://localhost:5173/sell — already a seller, redirects to dashboard
3. Show the **red badge** on the Orders tab — this is the new order you just placed as the buyer
4. Click **Orders** — see the buyer order with item list and delivery address
5. Click **Mark as packed**
6. Click **Mark as shipped**

Say: *"The seller got a notification the moment the order was placed. They packed it, shipped it. The buyer just got notified."*

Also show:

- **Products** tab → list of own products
- **Analytics** tab → monthly revenue chart, top selling, most viewed

### 4. Buyer refresh — Window A — 30 seconds

1. Refresh the order tracking page
2. **The timeline updated** — Packed and Shipped now have timestamps and show the seller name
3. Click the bell icon in the navbar — see the notifications

### 5. Admin peek — 30 seconds

1. Log out of seller window, log in as `admin@kora.test` / `Password123!`
2. Go to /admin
3. Show platform stats, user list, and audit log

Say: *"Every admin action is logged. Actor, action, target, timestamp."*

## Q&A Preparation

### "Is it scalable?"

> Yes. Our auth is stateless JWT, so we can run multiple backend instances behind a load balancer without session affinity. Product searches use PostgreSQL full-text indexes — a GIN index on a tsvector column — not sequential scans. Stock updates use optimistic locking to prevent overselling under concurrent checkouts. All auth endpoints are rate-limited. We use HikariCP connection pooling. And we have a caching layer ready to activate with Redis in Phase 2. The architecture is built for horizontal scaling — we run a single instance today to keep costs down during development.

### "Why PostgreSQL over MongoDB?"

> E-commerce needs ACID transactions. Orders, payments, and inventory have to stay consistent. MongoDB has eventual consistency on multi-document writes, which risks overselling. PostgreSQL also gives us full-text search built-in — no separate search server needed.

### "What was the hardest part?"

> The order tracking timeline. We could not just store the current status — we needed history. Every transition writes to an `order_status_history` table with a timestamp and actor. The timeline is built from that table. It also meant designing a state machine for allowed transitions — sellers can only move PAID to PACKED to SHIPPED, admins can move any forward status, but nothing can move backwards.

### "How do you handle errors?"

> A global exception handler catches everything and returns RFC 7807 Problem Details. Stack traces never leak to the client. Validation errors list each field. Business rule violations return a clear message.

### "What about tests?"

> JUnit 5 unit tests for service logic, and Testcontainers integration tests that spin up a real PostgreSQL instance for HTTP endpoint testing. Tests run in CI via GitHub Actions.

### "Why not microservices?"

> At this scale, microservices add operational complexity without scale benefits. A modular monolith with clean domain boundaries gives us microservice-readiness. Notifications would be the first extraction candidate because it is already loosely coupled.

## Account Reference

Password for all demo accounts: `Password123!`

| Email | Role |
|-------|------|
| customer@kora.test | Buyer |
| blessing@kora.test | Seller |
| nathan@kora.test | Seller |
| techhub@kora.test | Seller |
| admin@kora.test | Admin |

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/api/health

## If Something Breaks

**Backend not running:** frontend shows "failed to fetch". Start backend in its window.

**Port 8080 already in use:**

    $pid = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
    Stop-Process -Id $pid -Force

Then restart `mvn spring-boot:run`.

**Database empty:** the `DataSeeder` runs automatically if `users` table has zero rows. To force:

    psql -U kora -h localhost -d kora_db -c "TRUNCATE users CASCADE;"

Then restart backend.

**Login fails with fresh account:** passwords must be 8+ chars. Use `Password123!`.
