# KORA — QUICK ANSWER CHEAT SHEET

## Q: Is it scalable?
Yes. Stateless JWT auth — any backend instance serves any request. Indexed
queries (GIN for search, B-tree for FKs). Optimistic locking prevents
overselling. Rate limiting on auth. HikariCP pooling. Redis-ready cache.

## Q: Why PostgreSQL and not MongoDB?
E-commerce needs ACID. Checkout must create order + decrement stock +
notify in one transaction. MongoDB is eventually consistent on multi-
doc writes — risks overselling. Postgres also has full-text search
built in (tsvector + GIN) and enforces foreign keys.

## Q: What was the hardest part?
Order tracking timeline. Not just status field — history. Every
transition writes to order_status_history with timestamp + actor.
Plus a state machine for allowed transitions.

## Q: How do you handle security?
JWT 15-min access + 7-day refresh. BCrypt cost 12. Role-based access
with @PreAuthorize. Parameterized queries only. Rate limiting on auth.
Global exception handler. No stack traces leak.

## Q: Why not microservices?
At this scale, complexity without benefit. Modular monolith with clean
domain boundaries. Microservice-ready. Notifications would extract first.

## Q: What about tests?
Six unit tests with JUnit 5 + Mockito. Integration tests with
Testcontainers spinning up real PostgreSQL. All green.

## Q: What is the standout feature?
Order tracking timeline. Every status change writes to order_status_history
with timestamp + actor + note. Buyer sees WHEN and WHO, not just current
status. Like Amazon.

## Q: What is Phase 2?
Redis distributed caching. RabbitMQ async notifications. Docker Compose.
WebSocket live tracking. Real Stripe payments.

