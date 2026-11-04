# Kora Marketplace

**Fast and Easy Marketing** — a production-grade, two-sided e-commerce marketplace.

## 🚀 Tech Stack
- **Backend:** Java 21, Spring Boot 3.3, Spring Security (JWT), Hibernate, Flyway
- **Database:** PostgreSQL 15
- **Frontend:** React 18, Vite, Redux Toolkit, Tailwind CSS
- **Payments:** Paystack (Escrow, Direct Charge, Webhooks)
- **DevOps:** Docker, Kubernetes (K8s), Jenkins CI/CD

## 🛡️ Core Features
- **Two-Sided Marketplace:** Separate flows for Buyers and Sellers (One account = one role).
- **Seller KYC:** Identity uploads, GPS verification, and bank account resolution via Paystack API.
- **Escrow Payments:** Funds are held securely until delivery is confirmed, then split 85/15 (Seller/Kora).
- **Seller Wallet:** Real-time balance (In-Escrow vs Available) with admin-approved withdrawals.
- **Rent System:** Sellers pay a monthly subscription; unpaid accounts get locked automatically.
- **Admin Console:** Dashboards for KYC review, Withdrawal approvals, and Rent tracking.
- **Security:** Webhook signature verification (HMAC SHA-512), Refresh Token Rotation, Rate Limiting.

## 🐳 DevOps & Deployment
This project is built for modern CI/CD:
- **Containerized:** Multi-stage Dockerfiles for both Frontend and Backend.
- **Kubernetes:** Manifests provided for Deployments, Services, and a PostgreSQL StatefulSet.
- **Jenkins Pipeline:** A `Jenkinsfile` is included to automate the build, Docker push, and K8s deployment.
- **Docker Compose:** Full local stack deployment (`docker-compose up`).

## 🏃‍♂️ Quick Start
1. Ensure Docker Desktop and Kubernetes are running.
2. Run `docker-compose up -d` to start the database, backend, and frontend.
3. Access the frontend at `http://localhost:5173`.

## 🔐 Demo Accounts
Password for all: `Password123!`
- `admin@kora.test` (Admin)
- `blessing@kora.test` (Seller - KYC Verified)
- `customer@kora.test` (Buyer)