# KORA - LIVE PRESENTATION REFERENCE

Open in Notepad. Use Ctrl+F to search.

=== SECTION 1 - PRE-CLASS CHECKLIST (do 15 min before) ===

WINDOW 1 (backend):
   cd C:\Users\pc\Desktop\kora\backend
   mvn spring-boot:run
   Wait for: Started KoraApplication

WINDOW 2 (frontend, new PowerShell):
   cd C:\Users\pc\Desktop\kora\frontend
   npm run dev
   Wait for: Local: http://localhost:5173/

WINDOW 3 (spare):
   Leave empty.

BROWSERS:
   Chrome normal:    customer@kora.test / Password123!
   Firefox or Edge:  blessing@kora.test / Password123!
   Chrome incognito: admin@kora.test / Password123!

Extra tab: http://localhost:8080/swagger-ui.html

Verify: Invoke-RestMethod "http://localhost:8080/api/health"  -> status UP

DO NOT close any PowerShell window during the presentation.

=== SECTION 2 - LIVE COMMANDS ===

--- HEALTH CHECK ---
Invoke-RestMethod "http://localhost:8080/api/health"

--- LIST PRODUCTS ---
Invoke-RestMethod "http://localhost:8080/api/products?size=5" | Select-Object totalElements

--- LIST CATEGORIES ---
Invoke-RestMethod "http://localhost:8080/api/categories" | Select-Object name

--- LOGIN AS BUYER ---
$body = @{ email = "customer@kora.test"; password = "Password123!" } | ConvertTo-Json
$auth = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -ContentType "application/json" -Body $body
$token = $auth.accessToken

--- MY ORDERS ---
Invoke-RestMethod "http://localhost:8080/api/orders?size=5" -Headers @{ Authorization = "Bearer $token" }

--- ORDER TRACKING ---
Invoke-RestMethod "http://localhost:8080/api/orders/4/tracking" -Headers @{ Authorization = "Bearer $token" }

--- SHOW DB TABLES ---
$env:PGPASSWORD="kora_dev_password"
psql -U kora -h localhost -d kora_db -c "\dt"

--- SHOW USERS ---
psql -U kora -h localhost -d kora_db -c "SELECT email, full_name, role FROM users;"

--- SHOW ORDER STATUS HISTORY ---
psql -U kora -h localhost -d kora_db -c "SELECT order_id, status, created_at FROM order_status_history ORDER BY created_at DESC LIMIT 10;"

--- RUN UNIT TESTS ---
cd C:\Users\pc\Desktop\kora\backend
mvn test -Dtest=AuthServiceTest,ProductServiceTest

--- PORT 8080 IN USE ---
$pid = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $pid -Force



=== SECTION 3 - SPINNING CAROUSEL (exact answer) ===

Q: What did you use to build the spinning carousel?

ANSWER:
   Pure CSS 3D transforms driven by Framer Motion. No Three.js, no WebGL.
   Each card is positioned with perspective + transform-style: preserve-3d.
   rotateY() places them around a circle, translateZ() pushes them out.
   Framer Motion runs an animation loop incrementing rotation every frame,
   so the ring spins continuously.
   Depth effect (front cards big, back cards small and dim) is computed
   with a cosine function on each card angle, mapped to scale + opacity
   via Framer Motion useTransform.
   Cursor tilt tracks mouse position relative to the container center.

TECH USED:
   CSS 3D:  perspective: 1500px  |  transform-style: preserve-3d
            rotateY(angle) translateZ(radius) per card
   Framer Motion: useAnimationFrame, useMotionValue, useSpring, useTransform
   React: useMemo, useRef, useState

WHY NOT THREE.JS:
   Overkill. 600KB bundle weight, jank on low-end devices, external HMR.
   CSS 3D does the same effect via the browser GPU natively.

WHY NOT JUST CSS KEYFRAMES:
   Keyframes rotate but cannot compute per-card depth. We need scale and
   opacity per card based on angle. That needs JavaScript reading rotation
   every frame. Framer Motion gives us that pipeline.


=== SECTION 4 - TECH STACK ===

JAVA 21
   What: Modern LTS Java version.
   Why: Long-term support, records, pattern matching.
   Kora: Every backend class.

SPRING BOOT 3.3
   What: Framework bundling Spring + Tomcat + auto-config.
   Why: Industry standard for Java backends.
   Kora: Every controller/service/repository is a Spring bean.

SPRING SECURITY
   What: Auth framework.
   Why: Battle-tested, JWT-friendly.
   Kora: JwtAuthenticationFilter + @PreAuthorize role guards.

SPRING DATA JPA / HIBERNATE
   What: ORM mapping Java objects to DB tables.
   Why: No boilerplate SQL. Parameterized queries prevent SQL injection.
   Kora: 14 entities, 13 repositories.

JWT
   What: Signed tokens for stateless auth.
   Why: No session storage. Any server verifies any token.
   Kora: 15-min access, 7-day refresh, HMAC-SHA512.

BCRYPT
   What: Password hashing with cost factor.
   Why: Slow by design - brute-force expensive.
   Kora: Cost 12, ~250ms per hash.

FLYWAY
   What: DB migration tool.
   Why: Version-controlled schema, auditable, reversible.
   Kora: 11 migrations V1-V11.

BUCKET4J
   What: Rate limiting library.
   Why: Protects auth endpoints from brute force.
   Kora: 5 req/min per IP on /auth/login and /auth/register.

MAPSTRUCT
   What: Compile-time Entity<->DTO mapper.
   Why: No runtime reflection, faster than ModelMapper.
   Kora: UserMapper, ProductMapper.

LOMBOK
   What: Annotation processor for getters/setters/builders.
   Why: Removes boilerplate.
   Kora: @Getter @Setter @Builder on every entity.

SPRINGDOC OPENAPI
   What: Auto-generates Swagger UI from controllers.
   Why: Living API docs, interactive try-it.
   Kora: http://localhost:8080/swagger-ui.html


POSTGRESQL 15
   What: Open-source relational DB.
   Why: ACID, full-text search built-in, mature.
   Kora: 14 tables.

FULL-TEXT SEARCH (tsvector + GIN)
   What: Postgres native text search.
   Why: Millisecond results with ranking, no LIKE scans.
   Kora: products.search_vector auto-populated by trigger.

OPTIMISTIC LOCKING (@Version)
   What: Concurrency control - reject update if row changed since read.
   Why: Prevents overselling under load.
   Kora: Product.version. Second buyer gets clear error.

REACT 18
   What: Component-based UI library.
   Why: Industry standard, huge ecosystem.
   Kora: Every page is a React component, lazy-loaded.

VITE
   What: Modern build tool with instant HMR.
   Why: 10x faster than Create React App.
   Kora: Dev server ready in ~2s.

REDUX TOOLKIT
   What: Opinionated state management.
   Why: Predictable state, less boilerplate.
   Kora: 3 slices - auth, catalog, admin.

REACT ROUTER 6
   What: Client-side routing.
   Why: Fast navigation, no reloads.
   Kora: 20+ routes.

TAILWIND CSS v4
   What: Utility-first CSS framework.
   Why: Fast, consistent, tree-shaken.
   Kora: Brand colors (leaf, canopy, ink) as tokens.

FRAMER MOTION
   What: Animation library for React.
   Why: Declarative, gesture support.
   Kora: Carousel, transitions, scroll reveals.

LUCIDE REACT
   What: Icon library.
   Why: Tree-shakeable SVG icons.
   Kora: Every icon.

JUNIT 5
   What: Java test framework.
   Why: Modern, extensible.
   Kora: 6 unit tests.

MOCKITO
   What: Mocking framework.
   Why: Isolates class under test.
   Kora: Repos mocked so no DB in unit tests.

TESTCONTAINERS
   What: Spins up Docker containers for tests.
   Why: Real Postgres, not in-memory fake.
   Kora: Integration tests for auth and products.


=== SECTION 5 - Q&A BANK ===

--- GENERAL ---
Q: What is Kora?
A: Two-sided e-commerce marketplace with three roles (buyer/seller/admin)
   and a complete commerce lifecycle from browsing to delivery and review.

Q: Why the name Kora?
A: A traditional West African instrument. Short, memorable, West-Africa rooted.
   Tagline: Fast and Easy Marketing.

Q: Is this copied from Temu?
A: No. Independent academic implementation. No shared code or branding.

--- ARCHITECTURE ---
Q: What architecture did you use?
A: Clean layered - Controller -> Service -> Repository -> Entity. Each layer
   has one job. DTOs decouple API from database.

Q: Why not microservices?
A: At this scale, microservices add operational complexity without scale
   benefits. Modular monolith with clean boundaries gives us microservice-
   readiness. Notifications would be the first extraction candidate.

Q: What is a modular monolith?
A: One deployable app with clear domain boundaries. Each domain (auth,
   products, orders) is self-contained. Org benefits of microservices
   without the infra cost.

Q: How many lines of code?
A: Roughly 15,000 across backend and frontend.

--- DATABASE ---
Q: How many tables?
A: 14 tables across 11 Flyway migrations.

Q: Why PostgreSQL over MySQL?
A: Better full-text search (tsvector), GIN indexes, JSON columns, stricter
   ACID. Both work; Postgres is more feature-complete.

Q: Why PostgreSQL over MongoDB?
A: E-commerce needs ACID. MongoDB eventual consistency on multi-document
   writes risks overselling. Postgres also has full-text search built-in.

Q: What is a Flyway migration?
A: Versioned SQL file. Every schema change is numbered (V1, V2, ...).
   Flyway tracks which are applied. Audit trail of schema changes.

Q: How do you handle schema changes?
A: New Flyway migrations. Never edit old ones. Preserves history.

Q: What is optimistic locking?
A: Each product row has a version column. Concurrent updates - second one
   fails because version changed. Prevents overselling.

--- AUTHENTICATION ---
Q: What is JWT?
A: JSON Web Token. Signed, self-contained. Contains user ID, role, expiry.
   Server verifies signature, no DB lookup needed.

Q: Why JWT over sessions?
A: Stateless. Any server verifies without shared session storage. This is
   what makes horizontal scaling possible.

Q: What happens when a token expires?
A: Access tokens last 15 min. Frontend silently uses refresh token (7 days)
   to get a new one. User never notices.

Q: How are passwords stored?
A: BCrypt hashed with cost factor 12. Never plaintext, never logged.

Q: What is rate limiting?
A: 5 req/min per IP on /auth/login and /auth/register. Prevents brute force.


--- FEATURES ---
Q: How does order tracking work?
A: Every status change writes a row to order_status_history with timestamp,
   actor, and optional note. Tracking page built from that history.
   Not a status field - a full timeline.

Q: What is the order status flow?
A: PENDING -> PAID -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED.

Q: Can an order go backwards?
A: No. State machine only allows forward transitions.

Q: Who moves the order forward?
A: Buyer pays (PENDING->PAID). Seller marks PACKED and SHIPPED. Admin marks
   OUT_FOR_DELIVERY and DELIVERED. Each transition fires a notification.

Q: How do reviews work?
A: Verified purchasers only. Backend checks the buyer has an order with
   status DELIVERED for that product. One review per user per product.

Q: How does full-text search work?
A: Postgres tsvector auto-populated by trigger. GIN index for speed.
   plainto_tsquery with ts_rank for relevance.

Q: How are product images uploaded?
A: File picker -> backend validates MIME + size (max 5MB) -> UUID filename
   -> stored on disk -> served as static asset. Production swaps to S3.

--- SCALABILITY ---
Q: Is it scalable?
A: Yes. Stateless JWT. Indexed queries (GIN search, B-tree FKs). Optimistic
   locking. Rate limiting. HikariCP pooling. Cache layer wired and Redis-ready.

Q: How many users can it handle?
A: One instance handles hundreds of concurrent users. Horizontal scale by
   adding instances behind a load balancer.

Q: What is the cache layer?
A: Spring Cache @Cacheable on product reads. Currently in-memory. Phase 2
   swaps to Redis for distributed caching.

Q: What is HikariCP?
A: Connection pool Spring Boot uses by default. Reuses DB connections.

--- PROBLEMS ---
Q: What was the hardest part?
A: The order tracking timeline. Could not just store current status -
   needed history. Designed order_status_history + state machine.

Q: What would you do differently?
A: Add integration tests earlier. Use Redis from day one.

Q: What is a known limitation?
A: Notification delivery is synchronous inside the order transaction.
   Phase 2 moves it to RabbitMQ. Payments use mock service - Phase 2 Stripe.

Q: What is not deployed?
A: Phase 1 runs locally. Deployment to Render + Vercel + Neon is Phase 2.

--- TESTS ---
Q: Do you have tests?
A: Yes. 6 unit tests (JUnit 5 + Mockito) for auth and product ownership.
   Integration tests with Testcontainers spin up real Postgres. All green.

Q: Why only 10 tests?
A: Focused on highest-risk areas - auth and ownership. Phase 2 expands to
   orders and payments.

--- DEVELOPMENT ---
Q: How long did this take?
A: Phase 1 built over roughly two weeks.

Q: What tools did you use?
A: VS Code, IntelliJ, Git, Postman, pgAdmin, Docker Desktop, Maven, npm.

Q: How did you divide work?
A: Nathan - backend, DB, security, order flow. Blessing - frontend, UI/UX,
   seller experience. Both understand the full system.


--- FEATURES ---
Q: How does order tracking work?
A: Every status change writes a row to order_status_history with timestamp,
   actor, and optional note. Tracking page built from that history.
   Not a status field - a full timeline.

Q: What is the order status flow?
A: PENDING -> PAID -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED.

Q: Can an order go backwards?
A: No. State machine only allows forward transitions.

Q: Who moves the order forward?
A: Buyer pays (PENDING->PAID). Seller marks PACKED and SHIPPED. Admin marks
   OUT_FOR_DELIVERY and DELIVERED. Each transition fires a notification.

Q: How do reviews work?
A: Verified purchasers only. Backend checks the buyer has an order with
   status DELIVERED for that product. One review per user per product.

Q: How does full-text search work?
A: Postgres tsvector auto-populated by trigger. GIN index for speed.
   plainto_tsquery with ts_rank for relevance.

Q: How are product images uploaded?
A: File picker -> backend validates MIME + size (max 5MB) -> UUID filename
   -> stored on disk -> served as static asset. Production swaps to S3.

--- SCALABILITY ---
Q: Is it scalable?
A: Yes. Stateless JWT. Indexed queries (GIN search, B-tree FKs). Optimistic
   locking. Rate limiting. HikariCP pooling. Cache layer wired and Redis-ready.

Q: How many users can it handle?
A: One instance handles hundreds of concurrent users. Horizontal scale by
   adding instances behind a load balancer.

Q: What is the cache layer?
A: Spring Cache @Cacheable on product reads. Currently in-memory. Phase 2
   swaps to Redis for distributed caching.

Q: What is HikariCP?
A: Connection pool Spring Boot uses by default. Reuses DB connections.

--- PROBLEMS ---
Q: What was the hardest part?
A: The order tracking timeline. Could not just store current status -
   needed history. Designed order_status_history + state machine.

Q: What would you do differently?
A: Add integration tests earlier. Use Redis from day one.

Q: What is a known limitation?
A: Notification delivery is synchronous inside the order transaction.
   Phase 2 moves it to RabbitMQ. Payments use mock service - Phase 2 Stripe.

Q: What is not deployed?
A: Phase 1 runs locally. Deployment to Render + Vercel + Neon is Phase 2.

--- TESTS ---
Q: Do you have tests?
A: Yes. 6 unit tests (JUnit 5 + Mockito) for auth and product ownership.
   Integration tests with Testcontainers spin up real Postgres. All green.

Q: Why only 10 tests?
A: Focused on highest-risk areas - auth and ownership. Phase 2 expands to
   orders and payments.

--- DEVELOPMENT ---
Q: How long did this take?
A: Phase 1 built over roughly two weeks.

Q: What tools did you use?
A: VS Code, IntelliJ, Git, Postman, pgAdmin, Docker Desktop, Maven, npm.

Q: How did you divide work?
A: Nathan - backend, DB, security, order flow. Blessing - frontend, UI/UX,
   seller experience. Both understand the full system.


--- SPECIFIC TECH ---
Q: What is Redux Toolkit?
A: Opinionated Redux wrapper. createSlice, createAsyncThunk, Immer for
   immutable updates. Less boilerplate than vanilla Redux.

Q: What is Vite?
A: Modern build tool with native ES modules for instant HMR. 10x faster
   than Webpack for dev.

Q: What is Tailwind CSS?
A: Utility-first CSS. className="bg-leaf text-white px-4" instead of CSS.
   Fast, consistent, tree-shaken.

Q: What is Framer Motion?
A: Animation library for React. Declarative - motion.div animate={{...}}.
   Used for carousel, transitions, scroll reveals.

Q: What is MapStruct?
A: Compile-time mapper generator. Interface in, implementation out.
   Faster than reflection-based mappers.

Q: What is Lombok?
A: Annotation processor generating getters/setters/builders. Removes
   boilerplate from entities.

Q: What is Testcontainers?
A: Library that spins up Docker containers for tests. Real Postgres
   for integration tests.

Q: What is Swagger?
A: Interactive API docs. Auto-generated from controller annotations.
   Test endpoints at /swagger-ui.html.

--- SCENARIO QUESTIONS ---
Q: What if two buyers buy the last item?
A: Optimistic locking on Product.version. One succeeds. The other gets
   ObjectOptimisticLockingFailureException. Frontend shows out of stock.

Q: What if the server crashes mid-order?
A: Whole checkout is one @Transactional block. If it fails, everything
   rolls back. No partial state.

Q: What if a seller edits another seller's product?
A: ProductService checks ownership. Returns 403 Forbidden.

Q: What if someone brute-forces login?
A: Rate limiting - 5/min per IP. Returns 429 Too Many Requests.

Q: What if the JWT secret is leaked?
A: Rotating the secret invalidates all tokens. Secret stored in env vars,
   never in source.

Q: What if you scale to 10 servers?
A: JWT is stateless. Any server verifies any token. No session store.
   Database connection pool per instance.

Q: What if the database is slow?
A: Add read replica for search/product reads. Cache hot products in Redis.
   Phase 3 covers this.


=== SECTION 6 - EMERGENCY RECOVERY ===

IF BACKEND CRASHES:
   1. Window 1 (backend). Press Ctrl+C.
   2. Run: mvn spring-boot:run
   3. Wait for: Started KoraApplication
   4. Say: "Give me 30 seconds."

IF FRONTEND CRASHES:
   1. Window 2 (frontend). Press Ctrl+C.
   2. Run: npm run dev
   3. Wait for: Local: http://localhost:5173/
   4. Refresh browser.

IF LOGIN FAILS:
   1. Open incognito window.
   2. Log in fresh.
   3. If still failing - is backend running? Check Window 1.

IF PORT 8080 IN USE:
   $pid = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
   Stop-Process -Id $pid -Force
   cd C:\Users\pc\Desktop\kora\backend
   mvn spring-boot:run

IF EVERYTHING BROKEN:
   Say: "Let me walk you through the code instead."
   Open: C:\Users\pc\Desktop\kora\backend\src\main\java\com\kora\service\OrderService.java
   Point at the checkout() method. Explain the flow.

=== SECTION 7 - THE THREE SENTENCES THAT WIN ANY ANSWER ===

When asked about ANY technical decision:

   1. "We chose X because Y."
   2. "The alternative was Z, but [reason not to]."
   3. "In our case, this gave us [concrete benefit]."

Example - "Why JWT over sessions?"

   "We chose JWT because it is stateless - any server can verify a token
   without shared session storage. The alternative was server-side sessions
   with Redis. In our case, JWT lets us run multiple backend instances
   behind a load balancer with zero coordination."

Use that pattern for every question. It shows structured thinking.

=== END ===

You built this. You know every part. If they ask something you cannot
answer, say "Let me think about that" then answer honestly.

Kill it.
