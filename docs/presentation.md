# KORA — Phase 1 Presentation

Total time: 12 minutes + Q&A. 14 slides. Two presenters.

---

## PRE-CLASS CHECKLIST (do 15 min before)

1. Open THREE PowerShell windows:

   Window 1 (backend):
       cd C:\Users\pc\Desktop\kora\backend
       mvn spring-boot:run
       Wait for: Started KoraApplication

   Window 2 (frontend):
       cd C:\Users\pc\Desktop\kora\frontend
       npm run dev
       Wait for: Local: http://localhost:5173/

   Window 3 (spare):
       Leave empty for testing

2. Open TWO browsers:
   - Chrome (normal) — log in as customer@kora.test / Password123!
   - Firefox or Edge — log in as blessing@kora.test / Password123!

3. Verify: http://localhost:8080/api/health shows UP

4. Verify: http://localhost:5173 loads the landing page

5. Practice the demo flow ONCE. Then close practice tabs.

6. DO NOT close any PowerShell window during the presentation.

---

## SLIDE 1 — TITLE

Content:
    KORA MARKETPLACE
    Fast and Easy Marketing
    
    Full-Stack E-Commerce Platform
    Phase 1 Presentation
    
    Adedayo Nathan  ·  Adedayo Blessing
    NIIT MMS4

Speaker notes:
    Good morning. We are Nathan and Blessing. Our project is Kora — a full-stack e-commerce marketplace where independent sellers list products and buyers discover them with a real order tracking experience.

---

## SLIDE 2 — THE PROBLEM

Content:
    Most student marketplace projects stop at:
    -   A list of products
    -   A button that says "Buy"
    -   An order status field that says PAID
    
    Real marketplaces are about TRUST:
    -   Where is my package?
    -   Who is the seller?
    -   What happened after I paid?

Speaker notes:
    Anyone can build a CRUD shop. We wanted to solve the trust problem that real e-commerce companies solve. When you buy from Jumia or Amazon you are not just buying a product — you are buying confidence that the order will actually arrive. That confidence comes from tracking, from verified sellers, from notifications. That is what we built.

---

## SLIDE 3 — WHAT KORA IS

Content:
    A two-sided marketplace with THREE roles:
    
    BUYER      Discover, buy, track, review
    SELLER     List products, fulfil orders, analytics
    ADMIN      Monitor platform, manage users, audit
    
    Complete lifecycle:
    
    Browse -> Cart -> Checkout -> Paid -> Packed
    -> Shipped -> Out for Delivery -> Delivered -> Reviewed

Speaker notes:
    Kora is not a single-user shop. It is a marketplace. Three distinct user types, three distinct experiences. The buyer journey ends with a review. The seller journey starts with a notification and ends with an analytics dashboard. The admin sits on top and sees everything. This is real marketplace architecture.

---

## SLIDE 4 — TECH STACK

Content:
    FRONTEND
        React 18, Vite, Redux Toolkit
        Tailwind CSS v4, Framer Motion
    
    BACKEND
        Java 21, Spring Boot 3.3
        Spring Security, Spring Data JPA
        Hibernate, Flyway
    
    DATABASE     PostgreSQL 15
    AUTH         JWT (access + refresh), BCrypt
    TESTING      JUnit 5, Mockito, Testcontainers
    DOCS         Springdoc OpenAPI (Swagger)

Speaker notes:
    We chose an industry-standard stack. Spring Boot is what most enterprise backends run on. React is the frontend default. PostgreSQL for the database because e-commerce needs ACID transactions. JWT for stateless auth. Flyway for versioned database migrations. These are not just choices — each one is defensible.

---

## SLIDE 5 — ARCHITECTURE

Content:
    [ React Frontend ]
         |  HTTP / JSON
         v
    [ Spring Boot Backend ]
       Controller layer    HTTP, validation, auth
       Service layer       business rules, @Transactional
       Repository layer    Spring Data JPA
       Entity layer        domain objects
       Security layer      JWT filter, role guards
       Cache layer         Spring Cache (Redis-ready)
       Payment layer       interface + Mock impl
         |  JPA / Hibernate
         v
    [ PostgreSQL 15 ]

Speaker notes:
    Clean layered architecture. Controllers never touch the database. Services contain all business rules. Repositories are pure data access. Each layer has one job and only knows about the layer below it. This is what makes it testable and maintainable.

---

## SLIDE 6 — THE STANDOUT: ORDER TRACKING

Content:
    Order #4 — Tracking Timeline
    
    Order placed         Sep 17, 2:30 PM      Demo Customer
    Payment confirmed    Sep 17, 2:31 PM      Demo Customer
    Packed               Sep 17, 4:00 PM      Adedayo Blessing
    Shipped              Sep 17, 6:00 PM      Adedayo Blessing
    Out for delivery     Sep 18, 8:00 AM      Kora Admin
    Delivered            Sep 18, 11:00 AM     Kora Admin
    
    Not a status field. A TIMELINE.
    Every transition: timestamp + actor + note.

Speaker notes:
    This is our standout feature. Most student projects store the current status of an order in a single field. We store HISTORY. Every time the status changes, a new row is written to order_status_history with a timestamp, the actor who made the change, and an optional note. The tracking page is built from that history. So the buyer does not just see "your order is shipped" — they see WHEN it was shipped, WHO shipped it, and every step leading up to that moment. This is how real marketplaces work.

---

## SLIDE 7 — FEATURES BY ROLE

Content:
    BUYER
      Register, login, browse, search, filter
      Cart, wishlist, checkout
      LIVE order tracking timeline
      Notifications, product reviews
    
    SELLER
      One-click seller upgrade
      File upload for product images
      Add / edit / delete products
      New-order notification instantly
      Mark PACKED then SHIPPED
      Sales dashboard: revenue, top products, charts
    
    ADMIN
      Platform statistics
      User management, role change, suspend
      Order fulfillment: out for delivery -> delivered
      Audit log of every admin action

Speaker notes:
    Everything you see here is working end to end in Phase 1. No mock data — real PostgreSQL rows. Sellers actually receive notifications when buyers place orders. Buyers actually see their package move through states. Admins actually see the audit trail.

---

## SLIDE 8 — DATABASE DESIGN

Content:
    14 tables across 11 Flyway migrations
    
    Users & Auth        users, refresh_tokens
    Catalog             categories, products, product_images
    Shopping            carts, cart_items, wishlists, wishlist_items
    Orders              orders, order_items, order_status_history
    Engagement          reviews, notifications, product_views
    Admin               audit_log
    
    INNOVATIONS:
      Full-text search     PostgreSQL tsvector + GIN index
      Optimistic lock      @Version on product stock
      Audit trail          order_status_history + audit_log

Speaker notes:
    Our schema is version-controlled with Flyway migrations. Every table change goes through a numbered migration file. Full-text search uses PostgreSQL tsvector with a GIN index — that means searching for products is a millisecond operation, not a table scan. Stock is protected by optimistic locking so two buyers cannot buy the last item at the same time. And every admin action is recorded with actor, action, and timestamp.

---

## SLIDE 9 — SECURITY

Content:
    AUTH
      JWT access tokens (15 min) + refresh tokens (7 days)
      BCrypt password hashing, cost factor 12
    
    AUTHORIZATION
      Role-based access control
      @PreAuthorize on every protected endpoint
    
    ATTACK SURFACE
      Parameterized queries (no SQL injection)
      Bean Validation on every request DTO
      Rate limiting: 5 req/min on auth endpoints
      CORS whitelist
      Global exception handler (no stack traces leak)

Speaker notes:
    Security was not an afterthought. JWT gives us stateless authentication. Refresh tokens let us revoke access without storing sessions. Passwords go through BCrypt cost 12 — that is about 250 milliseconds to hash, which makes brute-force attacks expensive. Rate limiting on login prevents credential stuffing. And every query is parameterized, so SQL injection is structurally impossible.

---

## SLIDE 10 — SCALABILITY

Content:
    "IS IT SCALABLE?"
    
    YES. HERE IS HOW:
    
      Stateless auth          Any backend instance serves any request
      Indexed queries         GIN for search, B-tree for joins
      Optimistic locking      Safe under concurrency, no distributed lock
      Rate limiting           Protects against abuse at filter level
      Connection pooling      HikariCP, tuneable
      Cache layer             Spring Cache, Redis-ready
      Payment abstraction     Swap Mock for Stripe, no code changes
    
    PHASE 2:  Redis, RabbitMQ, Docker Compose, WebSockets
    PHASE 3:  Load testing, Prometheus, read replica, CDN

Speaker notes:
    This is the answer to the question you asked us to prepare for. Yes, it is scalable. Auth is stateless, so we can run ten backend instances behind a load balancer with zero code changes. Searches use database indexes, not scans. Stock cannot be oversold. And we have a caching layer that is one configuration change away from Redis. The architecture is built for scale from day one — we are running a single instance today to keep costs down during development.

---

## SLIDE 11 — LIVE DEMO

Content:
    LIVE DEMO
    
    1. Buyer places an order
    2. Seller receives notification -> marks PACKED
    3. Seller marks SHIPPED
    4. Admin marks OUT FOR DELIVERY -> DELIVERED
    5. Buyer refresh tracking — sees full timeline
    
    Backed by real PostgreSQL rows. No mock data.

Speaker notes:
    Let me show you it actually works. [Run the demo script below]

---

## SLIDE 12 — ROADMAP

Content:
    PHASE 1  (complete)
      Full marketplace, buyer/seller/admin
      Order tracking, reviews, notifications, analytics
    
    PHASE 2  (upgrade)
      Redis caching            Faster reads under load
      RabbitMQ                 Async notification processing
      WebSockets               Live order tracking
      Stripe                   Real payments
      Docker Compose           One-command local stack
    
    PHASE 3  (full scale)
      k6 load testing          Prove 500 concurrent users
      Prometheus + Grafana     Live monitoring
      Multi-instance           Behind a load balancer
      PostgreSQL read replica  Separate reads from writes

Speaker notes:
    Phase 1 is what you saw today. Phase 2 adds the infrastructure layer — caching, async processing, real-time updates, real payments. Phase 3 proves it scales. We are building incrementally because that is how real software is built.

---

## SLIDE 13 — TEAM

Content:
    ADEDAYO NATHAN
      Backend architecture and database design
      Authentication and security
      Order lifecycle and tracking system
      Seller and admin workflows
    
    ADEDAYO BLESSING
      Frontend development
      UI/UX design and component system
      Buyer experience and checkout flow
      Seller dashboard and analytics UI
    
    Both members understand the full system and can defend any module.

Speaker notes:
    We divided the work but each of us knows how the other person code works. If you ask Nathan about the frontend, he can answer. If you ask Blessing about the backend, she can answer. This was a real collaboration, not two separate projects glued together.

---

## SLIDE 14 — THANK YOU + Q&A

Content:
    THANK YOU
    
    Questions?
    
    Repository: github.com/Blessing56-max/Temu-clone
    Docs: docs/ folder (architecture, API, demo script)
    
    Demo accounts (password: Password123!):
      customer@kora.test   blessing@kora.test
      nathan@kora.test     admin@kora.test

Speaker notes:
    Thank you. We are happy to take questions. The repository is open to the group and has full documentation in the docs folder.

---

## LIVE DEMO SCRIPT (3 minutes)

### Step 1 — Landing page (15s)

Open http://localhost:5173

Say: "This is Kora. Product carousel, category tiles, trending products, all backed by our PostgreSQL database."

### Step 2 — Buyer places order (60s)

In Chrome (buyer logged in as customer@kora.test):

    1. Click Browse -> pick any product
    2. Click Add to cart
    3. Click cart icon -> Proceed to checkout
    4. Fill delivery details -> Place order
    5. Click Track order

Say: "This is our standout feature. Every status change is timestamped and attributed to whoever made it."

### Step 3 — Seller receives and fulfils (45s)

Switch to Firefox (seller logged in as blessing@kora.test):

    1. Refresh the seller dashboard
    2. Point out the RED BADGE on the Orders tab
    3. Click Orders -> see the buyers order
    4. Click Mark as packed
    5. Click Mark as shipped

Say: "The seller was notified the moment the order was placed. Two clicks and it is shipped."

### Step 4 — Admin delivers (30s)

Log out of seller, log in as admin@kora.test, go to /admin/orders:

    1. Filter shows the order in transit
    2. Click Mark out for delivery
    3. Click Mark delivered

Say: "Admin moves it through the final stages. Buyer gets notified at every step."

### Step 5 — Buyer sees timeline updated (30s)

Switch back to Chrome (buyer), refresh the tracking page:

    1. Full timeline: PENDING, PAID, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
    2. Click the notification bell — shows every status update
    3. Click Write a review on the delivered product — post 5 stars

Say: "That is the full loop — buyer to seller to admin and back to buyer, all in real time."

---

## Q&A PREPARATION

### "Is it scalable?"
Yes. Auth is stateless JWT, so we can run multiple backend instances behind a load balancer without session affinity. Product searches use PostgreSQL full-text indexes — a GIN index on a tsvector column, not sequential scans. Stock updates use optimistic locking to prevent overselling under concurrency. Auth endpoints are rate-limited. We use HikariCP connection pooling. And we have a caching layer ready to activate with Redis in Phase 2. The architecture is built for horizontal scaling — we run a single instance today.

### "Why PostgreSQL over MongoDB?"
E-commerce needs ACID transactions. Orders, payments, and inventory have to stay consistent. MongoDB has eventual consistency on multi-document writes, which risks overselling. PostgreSQL also gives us full-text search built-in — no separate search server needed.

### "What was the hardest part?"
The order tracking timeline. We could not just store the current status — we needed history. Every transition writes to an order_status_history table with a timestamp and actor. The timeline is built from that table. It also meant designing a state machine for allowed transitions — sellers can only move PAID to PACKED to SHIPPED, admins can move any forward status, but nothing can move backwards.

### "How do you handle errors?"
A global exception handler catches everything and returns RFC 7807 Problem Details. Stack traces never leak to the client. Validation errors list each field. Business rule violations return a clear message.

### "What about tests?"
JUnit 5 unit tests for service logic, and Testcontainers integration tests that spin up a real PostgreSQL instance for HTTP endpoint testing.

### "Why not microservices?"
At this scale, microservices add operational complexity without scale benefits. A modular monolith with clean domain boundaries gives us microservice-readiness. Notifications would be the first extraction candidate because it is already loosely coupled.

### "How do you handle file uploads?"
Sellers upload images directly from their file picker. The backend validates MIME type and file size (5 MB max), generates a UUID filename, stores it on disk, and serves it as a static asset. In production we would swap the storage layer for S3 or Cloudinary — the interface is already abstracted.

---

## DELIVERY TIPS

1. Never read the slide. The slide has bullets. You have the story.
2. If the demo breaks: say "we can show the tracking timeline next" and skip to what works. Do not debug live.
3. Have both backend and frontend running BEFORE you walk in.
4. If asked about a feature you did not build: "That is Phase 2 — we documented it in the roadmap."
5. If asked about scalability: use the answer on Slide 10.
6. Say "we" not "I" — this is a team project.
7. If you do not know: "That is a good question. Let me think about it — my instinct is X but I would want to verify."
8. Twelve minutes is the target. Do not rush. Do not ramble.

---

## TIME BUDGET (12 min)

  Slides 1-3    Opening           1 min
  Slides 4-6    What we built     2 min
  Slide 7       Order tracking    1 min
  Slides 8-9    Database + Sec    1.5 min
  Slide 10      Scalability       1 min
  Slide 11      Live demo         3 min
  Slide 12      Roadmap           1 min
  Slides 13-14  Team + close      1.5 min
