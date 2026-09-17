# Kora Architecture

## System Overview

    React + Vite (5173)  --HTTP/JSON-->  Spring Boot (8080)  --JPA-->  PostgreSQL (5432)

## Backend Layers

Kora is a modular monolith. Controller -> Service -> Repository -> Entity.

- **Controller** — HTTP only. Parse, validate, delegate, respond. No business logic.
- **Service** — business rules. `@Transactional` on writes.
- **Repository** — Spring Data JPA interfaces. Parameterized queries only.
- **Entity** — JPA-mapped domain objects.
- **DTO** — Java records, decoupled from entities.

## Database

14 tables across 10 Flyway migrations:

- V1: health_check
- V2: users, refresh_tokens
- V3: categories, products, product_images
- V4: carts, cart_items, wishlists, wishlist_items
- V5: orders, order_items, order_status_history
- V6: reviews, notifications
- V7: product_views
- V8: audit_log
- V9: real product images
- V10: expand catalog

**Indexes:**

- B-tree on all foreign keys
- GIN on `products.search_vector` for full-text search
- B-tree on `products.category_id`, `seller_id`, `active`, `price`

**Key constraints:**

- `products.version` — optimistic lock column
- `reviews (user_id, product_id)` unique — one review per user per product
- `cart_items (cart_id, product_id)` unique — no duplicate line items

## Search

PostgreSQL full-text search using `tsvector`. A trigger auto-populates `products.search_vector` on every insert/update from name + description. Queries use `plainto_tsquery` with `ts_rank` for relevance ordering.

Why not LIKE? `LIKE '%term%'` cannot use indexes, scans the whole table, and has no relevance ranking. GIN + tsvector runs in milliseconds on millions of rows.

## Optimistic Locking

`products.version` uses Hibernate `@Version`. When two buyers try to buy the last item concurrently, one transaction succeeds and the other gets an `ObjectOptimisticLockingFailureException` — the frontend shows "out of stock".

Why not pessimistic locking? Pessimistic locks block reads and hurt throughput. Optimistic is faster when conflicts are rare (which they are for stock updates).

## Security

- JWT with 15-min access + 7-day refresh tokens
- BCrypt cost factor 12 for password hashing
- Role-based access with `@PreAuthorize`
- CORS whitelist configurable via env
- Rate limiting: 5 req/min per IP on `/auth/login` and `/auth/register`
- Global exception handler: no stack traces leak
- Bean Validation on all request DTOs

## Order Lifecycle

    PENDING -> PAID -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED

Every transition inserts a row into `order_status_history` with a timestamp and the acting user. This is the data source for the customer tracking timeline.

Notifications fire on: order placed (buyer + every seller whose items are in the order), payment confirmed (buyer), every status change (buyer).

## Scalability

**Implemented today:**

- Stateless JWT auth — any backend instance can serve any request
- Indexed queries — full-text on GIN, FKs on B-tree
- Optimistic locking — safe under concurrency
- Rate limiting — abuse protection at filter level
- HikariCP connection pooling
- Caching layer (Spring Cache, Redis-swappable)
- Payment abstraction (`PaymentService` interface, Mock impl)

**Phase 2:** Redis, RabbitMQ, Docker Compose, WebSocket tracking, Stripe, email notifications.

**Phase 3:** Load testing (k6), Prometheus + Grafana, multi-instance behind load balancer, PostgreSQL read replica, CDN for images.

## Design Decisions

**Why PostgreSQL over MongoDB?** E-commerce needs ACID. MongoDB eventual consistency on multi-document writes risks overselling and inconsistent payments.

**Why JWT over sessions?** Stateless auth scales to N servers without shared session storage. Refresh tokens allow revocation.

**Why Flyway over `ddl-auto: update`?** Versioned migrations are auditable and reversible. `ddl-auto` in production is a footgun — it silently mutates schema.

**Why modular monolith over microservices?** At this scale, microservices add operational complexity without scale benefits. Clear domain boundaries give microservice-readiness when we need it.
