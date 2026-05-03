# Mercado E-commerce — API Documentation

Welcome to the Mercado Backend API documentation. This guide is designed for frontend engineers to integrate with the Mercado platform.

## 📌 Global Configuration

- **Base URL**: `http://localhost:5000/api/v1`
- **Content Type**: `application/json`
- **Auth Strategy**: JWT (Access Token in Header, Refresh Token in HttpOnly Cookie)

### Required Headers
| Header | Description |
| :--- | :--- |
| `Authorization` | `Bearer <access_token>` (Required for protected routes) |
| `x-session-id` | Persistent UUID for Guest Cart. Must be sent for all cart operations. |

---

## 🔐 Authentication & User

### Auth Flow
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Returns `accessToken` and sets `refreshToken` cookie.
3. **Refresh**: `POST /auth/refresh` → Send when Access Token expires.

| Endpoint | Method | Description | Protected |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Create new account | No |
| `/auth/login` | `POST` | Login & Merge Guest Cart | No |
| `/auth/verify-email` | `GET` | Verify email with `?token=` | No |
| `/auth/forgot-password` | `POST` | Request reset link | No |
| `/auth/reset-password` | `PATCH` | Set new password | No |
| `/users/me` | `GET` | Get profile & wallet balance | Yes |
| `/users/me` | `PATCH` | Update profile data | Yes |
| `/users/me/avatar` | `PATCH` | Upload avatar (Multipart) | Yes |
| `/users/me/wallet/topup` | `POST` | Add funds to wallet | Yes |

---

## 📦 Products & Categories

| Endpoint | Method | Description | Params |
| :--- | :--- | :--- | :--- |
| `/products` | `GET` | List/Search products | `search`, `category`, `sort`, `page` |
| `/products/:id` | `GET` | Get product details | - |
| `/products/featured` | `GET` | Get home page products | - |
| `/categories` | `GET` | List all categories | - |
| `/categories/:slug` | `GET` | Get category & subcategories | - |

---

## 🛒 Cart & Checkout

**Note**: Use `x-session-id` header to persist the cart for guest users.

| Endpoint | Method | Description | Body |
| :--- | :--- | :--- | :--- |
| `/cart` | `GET` | Get current cart & subtotal | - |
| `/cart/add` | `POST` | Add product to cart | `{ productId, quantity }` |
| `/cart/update` | `PATCH` | Update item quantity | `{ productId, quantity }` |
| `/cart/remove/:id` | `DELETE` | Remove item | - |
| `/cart/coupon` | `POST` | Apply promo code | `{ code }` |

---

## 💳 Orders & Payment

| Endpoint | Method | Description | Body |
| :--- | :--- | :--- | :--- |
| `/orders` | `POST` | Place new order | `{ shippingAddress, paymentMethod, promoCode }` |
| `/orders` | `GET` | My order history | - |
| `/orders/:id` | `GET` | Order details & Timeline | - |
| `/payment/card/pay` | `POST` | Pay for order (Mock) | `{ orderId, cardNumber, cvv... }` |
| `/payment/wallet/pay` | `POST` | Pay using wallet balance | `{ orderId }` |

---

## ⭐️ Reviews

| Endpoint | Method | Description | Constraint |
| :--- | :--- | :--- | :--- |
| `/reviews/product/:id` | `GET` | Get product reviews | - |
| `/reviews` | `POST` | Submit a review | **Must have purchased product** |

---

## 🏪 Seller Central

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/seller/register` | `POST` | Apply for seller account |
| `/seller/dashboard` | `GET` | Earnings & Performance stats |
| `/seller/products` | `GET` | Manage my listings |
| `/seller/payout` | `POST` | Request earnings payout |

---

## 🛡️ Admin Panel (Role: Admin)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/admin/analytics` | `GET` | Global platform statistics |
| `/admin/users` | `GET` | Manage users & suspensions |
| `/admin/sellers/approve` | `PATCH` | Approve new seller applications |
| `/admin/banners` | `POST` | Manage homepage banners |

---

## ⚠️ Error Handling
All errors follow this format:
```json
{
  "success": false,
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```
Common codes: `INVALID_CREDENTIALS`, `INSUFFICIENT_STOCK`, `UNAUTHORIZED`, `NOT_FOUND`.
