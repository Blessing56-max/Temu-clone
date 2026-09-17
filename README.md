# Kora Marketplace

**Fast and Easy Marketing** — a full-stack e-commerce marketplace where buyers discover products from verified sellers, with real order tracking from placement to delivery.

Independent academic project. Not affiliated with or endorsed by Temu. Built for NIIT MMS4.

## Stack

- **Frontend:** React 18, Vite, Redux Toolkit, Tailwind CSS v4, Framer Motion
- **Backend:** Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, Hibernate, Flyway
- **Database:** PostgreSQL 15
- **Auth:** JWT (access + refresh tokens), BCrypt
- **Testing:** JUnit 5, Mockito, Testcontainers

## What Works

Buyers: register, login, browse, search, filter, cart, wishlist, checkout, live order tracking, notifications, reviews.

Sellers: one-click become seller, add/edit/delete products, receive new-order notifications, mark orders PACKED and SHIPPED, sales dashboard with revenue and top products, analytics page.

Admins: platform stats, user management, role change, suspend, audit log.

## Quick Start

### 1. Create the database

    createdb kora_db
    psql -U postgres -c "CREATE USER kora WITH PASSWORD 'kora_dev_password';"
    psql -U postgres -c "ALTER DATABASE kora_db OWNER TO kora;"

### 2. Run backend

    cd backend
    mvn spring-boot:run

Runs on http://localhost:8080. Flyway migrates schema. DataSeeder populates 6 users, 8 categories, 46 products.

Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Run frontend

    cd frontend
    npm install
    npm run dev

Runs on http://localhost:5173.

## Demo Accounts

Password for all: `Password123!`

| Email | Role |
|-------|------|
| customer@kora.test | Buyer |
| blessing@kora.test | Seller |
| nathan@kora.test | Seller |
| techhub@kora.test | Seller |
| admin@kora.test | Admin |

## Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Demo Script](docs/demo-script.md)

## Team

- Adedayo Nathan — Backend, database, security, order flow
- Adedayo Blessing — Frontend, UI/UX, seller experience

## License

Academic project. All rights reserved by the authors.
