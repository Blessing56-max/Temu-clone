# Kora API Reference

**Base URL:** `http://localhost:8080/api`

All requests and responses are JSON. Authenticated endpoints require the header:

    Authorization: Bearer <accessToken>

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | — | Create a customer account. Returns tokens + user. |
| POST | /auth/login | — | Returns access + refresh tokens. |
| POST | /auth/refresh | — | Exchange refresh token for new access token. |
| POST | /auth/logout | Yes | Revoke all refresh tokens for current user. |
| GET | /auth/me | Yes | Get current authenticated user. |
| PUT | /auth/me | Yes | Update fullName and phone. |
| POST | /auth/change-password | Yes | Change password. Revokes refresh tokens. |

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /products | — | Search + filter + paginate. |
| GET | /products/{id} | — | Product detail. |
| POST | /products | SELLER | Create a product. |
| PUT | /products/{id} | SELLER | Update own product. |
| DELETE | /products/{id} | SELLER | Delete own product. |
| POST | /products/{id}/view | — | Record a product view. |
| GET | /products/{id}/reviews | — | List reviews for product. |

Query params for `/products`:

- `q` — full-text search query
- `categoryId` — filter by category
- `minPrice`, `maxPrice` — price range
- `page` (default 0), `size` (default 24, max 50)

## Categories

| Method | Path | Auth |
|--------|------|------|
| GET | /categories | — |
| POST | /categories | ADMIN |

## Cart

| Method | Path | Auth |
|--------|------|------|
| GET | /cart | Yes |
| POST | /cart/items | Yes |
| PUT | /cart/items/{id} | Yes |
| DELETE | /cart/items/{id} | Yes |

## Wishlist

| Method | Path | Auth |
|--------|------|------|
| GET | /wishlist | Yes |
| POST | /wishlist/items | Yes |
| DELETE | /wishlist/items/{id} | Yes |
| POST | /wishlist/items/{id}/move-to-cart | Yes |

## Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /orders/checkout | Yes | Create order from cart. Decrements stock. Clears cart. |
| POST | /orders/{id}/pay | Yes | Simulate payment. Moves status to PAID. |
| GET | /orders | Yes | Customer: own orders. Admin: all. |
| GET | /orders/{id} | Yes | Order detail. |
| GET | /orders/{id}/tracking | Yes | Full status timeline with timestamps + remaining steps. |
| PUT | /orders/{id}/status | SELLER/ADMIN | Update status. |

**Status flow:**

    PENDING -> PAID -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED

Sellers can only set `PACKED` or `SHIPPED` on orders containing their items. Admins can set any forward status.

**Tracking response example:**

    {
      "orderId": 1,
      "currentStatus": "SHIPPED",
      "estimatedDelivery": "2026-09-18T19:43:58Z",
      "delivered": false,
      "timeline": [
        { "status": "PENDING", "note": "Order placed", "createdAt": "...", "changedBy": "Customer" },
        { "status": "PAID", "note": "Payment confirmed", "createdAt": "...", "changedBy": "Customer" },
        { "status": "PACKED", "note": "Packed by seller", "createdAt": "...", "changedBy": "Seller" },
        { "status": "SHIPPED", "note": "Handed to courier", "createdAt": "...", "changedBy": "Seller" }
      ],
      "remainingSteps": ["OUT_FOR_DELIVERY", "DELIVERED"]
    }

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /reviews | Yes | Post review. Verified purchasers only (order must be DELIVERED). |
| GET | /products/{id}/reviews | — | List reviews with average rating. |

One review per user per product. Attempting a second returns 409.

## Notifications

| Method | Path | Auth |
|--------|------|------|
| GET | /notifications | Yes |
| GET | /notifications/unread-count | Yes |
| PUT | /notifications/{id}/read | Yes |

Notification types: `ORDER_PLACED`, `ORDER_PAID`, `ORDER_STATUS`, `NEW_ORDER` (seller), `SELLER_WELCOME`.

## Seller

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /seller/become | Yes | Upgrade current user to SELLER. |
| GET | /seller/dashboard | SELLER | Revenue, orders, top products, monthly chart. |
| GET | /seller/products | SELLER | Seller own products (paginated). |
| GET | /seller/orders | SELLER | Orders containing this seller items. |
| GET | /seller/pending-count | SELLER | Count of orders needing action. |

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /admin/stats | ADMIN | Platform-wide stats. |
| GET | /admin/users | ADMIN | Paginated user list. |
| PUT | /admin/users/{id}/suspend | ADMIN | Toggle enabled flag. |
| PUT | /admin/users/{id}/role | ADMIN | Change role. |
| GET | /admin/audit-logs | ADMIN | Paginated audit trail. |

## Errors

All errors use RFC 7807 Problem Details:

    {
      "type": "about:blank",
      "title": "Validation Failed",
      "status": 400,
      "detail": "email: must be a well-formed email address"
    }

Common status codes:

- 400 — validation or business rule violation
- 401 — missing or expired token
- 403 — authenticated but wrong role
- 404 — resource not found
- 409 — conflict (duplicate email, duplicate review)
- 429 — rate limit exceeded

## Interactive Docs

Full OpenAPI spec: `http://localhost:8080/swagger-ui.html`
