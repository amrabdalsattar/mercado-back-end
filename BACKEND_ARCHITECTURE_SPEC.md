# 🛒 E-Commerce Backend — Full Architecture Specification

> A production-ready Node.js + Express REST API for a multi-vendor e-commerce platform, built with clean architecture, SOLID principles, and modern DevOps practices.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Architecture Guidelines](#5-architecture-guidelines)
6. [Core Features & Modules](#6-core-features--modules)
   - [User Management](#61-user-management)
   - [Product Management](#62-product-management)
   - [Cart & Checkout](#63-cart--checkout)
   - [Order Management](#64-order-management)
   - [Payment Integration](#65-payment-integration)
   - [Admin Panel APIs](#66-admin-panel-apis)
   - [Seller / Vendor Features](#67-seller--vendor-features)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Security](#8-security)
9. [Validation Strategy](#9-validation-strategy)
10. [Error Handling](#10-error-handling)
11. [Pagination, Filtering & Sorting](#11-pagination-filtering--sorting)
12. [Email Notifications](#12-email-notifications)
13. [API Documentation (Swagger)](#13-api-documentation-swagger)
14. [Setup Instructions](#14-setup-instructions)
15. [Docker Setup](#15-docker-setup)
16. [Logging](#16-logging)
17. [Testing](#17-testing)
18. [Seed Data](#18-seed-data)
19. [Roles & Permissions](#19-roles--permissions)
20. [Authentication Flow](#20-authentication-flow)
21. [API Endpoint Reference](#21-api-endpoint-reference)
22. [Additions & Enhancements](#22-additions--enhancements)

---

## 1. Project Overview

This project is a **scalable, modular RESTful backend** for a full-featured e-commerce platform supporting three actor roles: **Customer**, **Seller (Vendor)**, and **Admin**. It is designed to be the backbone for a web/mobile storefront, an admin dashboard, and a seller portal.

### Key Design Principles

- **Feature-based modular architecture** — each domain (user, product, order…) is self-contained
- **SOLID principles** applied throughout service and repository layers
- **Clean Code** — expressive naming, single-responsibility functions, no magic strings
- **Separation of concerns** — routes → controllers → services → repositories → models
- **Security-first** — JWT auth, bcrypt, rate limiting, input sanitization
- **Documented** — Swagger UI + Markdown docs ship with the codebase

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js (≥ 20 LTS) | Async I/O, large ecosystem |
| Framework | Express.js | Lightweight, composable |
| Database | MongoDB + Mongoose | Flexible schema fits product catalog |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |
| Validation | Zod | Type-safe, composable schemas |
| Password | bcryptjs | Industry standard |
| Payment | Custom (COD) | Flexible, no third-party dependency |
| Email | Nodemailer (+ mock transport) | Easy swap to SES/SendGrid |
| Docs | Swagger / OpenAPI 3.0 | Auto-generated, interactive |
| Logging | Winston + Morgan | Structured logs, HTTP logging |
| Testing | Jest + Supertest | Unit + integration |
| Containers | Docker + Docker Compose | Reproducible environments |
| Linting | ESLint + Prettier | Code consistency |

---

## 3. Folder Structure

```
ecommerce-backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.model.js
│   │   │   ├── user.schema.js          # Zod validation schemas
│   │   │   └── user.dto.js             # Data transfer objects
│   │   ├── product/
│   │   │   ├── product.routes.js
│   │   │   ├── product.controller.js
│   │   │   ├── product.service.js
│   │   │   ├── product.repository.js
│   │   │   ├── product.model.js
│   │   │   └── product.schema.js
│   │   ├── category/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── payment/
│   │   ├── review/
│   │   ├── seller/
│   │   ├── admin/
│   │   ├── promo/                      # Promo codes & discounts
│   │   ├── notification/               # Email notification service
│   │   └── banner/                     # Homepage content management
│   ├── middlewares/
│   │   ├── auth.middleware.js           # JWT verification
│   │   ├── authorize.middleware.js      # Role-based access control
│   │   ├── validate.middleware.js       # Zod request validation
│   │   ├── rateLimiter.middleware.js    # express-rate-limit
│   │   ├── sanitize.middleware.js       # mongo-sanitize / xss-clean
│   │   ├── upload.middleware.js         # Multer file uploads
│   │   └── errorHandler.middleware.js   # Centralized error handler
│   ├── utils/
│   │   ├── AppError.js                 # Custom error class
│   │   ├── asyncHandler.js             # Wraps async route handlers
│   │   ├── ApiResponse.js              # Standardized response shape
│   │   ├── paginate.js                 # Pagination helper
│   │   ├── token.js                    # JWT sign / verify helpers
│   │   ├── email.js                    # Nodemailer wrapper
│   │   └── logger.js                   # Winston logger
│   ├── config/
│   │   ├── db.js                       # Mongoose connection
│   │   ├── env.js                      # Validated env variables
│   │   ├── swagger.js                  # Swagger setup
│   │   └── cloudinary.js               # Image upload config
│   ├── seeds/
│   │   ├── users.seed.js
│   │   ├── products.seed.js
│   │   └── index.seed.js
│   └── app.js                          # Express app (no listen)
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
├── API_DOCUMENTATION.md
└── README.md
```

---

## 4. Environment Configuration

Create a `.env` file at the project root. **Never commit `.env` to version control.**

```env
# ── Server ────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=5000

# ── MongoDB ───────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/ecommerce

# ── JWT ───────────────────────────────────────────
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Bcrypt ────────────────────────────────────────
BCRYPT_SALT_ROUNDS=12

# ── Email (Nodemailer) ────────────────────────────
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM="E-Shop <no-reply@eshop.com>"

# ── Cloudinary ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# ── Rate Limiting ─────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=100

# ── Frontend ──────────────────────────────────────
CLIENT_URL=http://localhost:3000
```

All variables are validated at startup via a `config/env.js` module using Zod — the server exits with a clear error if any required variable is missing.

---

## 5. Architecture Guidelines

### 5.1 Layer Responsibilities

```
Request → Router → Controller → Service → Repository → Model
                              ↓
                         (Business Logic)
```

| Layer | Responsibility |
|---|---|
| **Router** | Mount endpoints, attach middlewares, delegate to controller |
| **Controller** | Parse request, call service, return `ApiResponse` |
| **Service** | Orchestrate business logic, call repositories, throw `AppError` |
| **Repository** | All DB queries — no business logic |
| **Model** | Mongoose schema, virtuals, indexes |
| **Schema (DTO)** | Zod shapes for request body/params/query validation |

### 5.2 Standardized API Response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 350,
    "totalPages": 18
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "errors": []
}
```

### 5.3 Async Handler Pattern

```js
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

All route handlers are wrapped with `asyncHandler` — no try/catch boilerplate in controllers.

---

## 6. Core Features & Modules

### 6.1 User Management

**Model fields:** `name`, `email`, `phone`, `password (hashed)`, `role`, `avatar`, `isVerified`, `isActive`, `wishlist[]`, `addresses[]`, `wallet`, `refreshToken`

| Feature | Details |
|---|---|
| Registration | Email + password or phone + OTP |
| Login | Returns access token (15 min) + refresh token (7 days, httpOnly cookie) |
| Token Refresh | `POST /auth/refresh` — issues new access token |
| Logout | Invalidates refresh token in DB |
| Email Verification | Token sent on registration; required before login |
| Password Reset | Time-limited reset link via email |
| Profile | View/update name, avatar, addresses |
| Wishlist | Add/remove products; full list retrieval |
| Order History | Paginated list of past orders |
| Reviews | View all reviews left by user |
| Wallet | Mock balance; top-up & deduct operations |

---

### 6.2 Product Management

**Model fields:** `title`, `slug`, `description`, `price`, `salePrice`, `images[]`, `category`, `seller`, `stock`, `sku`, `tags[]`, `attributes{}`, `ratings`, `reviewCount`, `isActive`, `isFeatured`

| Feature | Details |
|---|---|
| Categories | Nested categories (parent → children) with slugs |
| Product CRUD | Sellers manage their own; Admin manages all |
| Image Upload | Multer → Cloudinary (up to 8 images per product) |
| Stock Management | Decrement on order, increment on cancellation |
| Search | Full-text search on title + description (MongoDB text index) |
| Filtering | Price range, category, rating, availability, seller |
| Sorting | Price (asc/desc), newest, best-rated, most-reviewed |
| Pagination | Cursor or offset; default 20 per page |
| Featured Products | Admin flags; used for homepage display |

---

### 6.3 Cart & Checkout

**Cart Model:** `user` (nullable for guests), `sessionId` (for guests), `items[]{ product, quantity, price }`, `coupon`, `expiresAt`

| Feature | Details |
|---|---|
| Add / Remove Items | Validates stock before adding |
| Update Quantity | Re-validates stock |
| Order Summary | Subtotal, discount, shipping estimate, tax, total |
| Guest Cart | Cart linked to `sessionId`; merged on login |
| Promo Codes | Fixed amount or percentage discount; expiry & usage limits |
| Checkout | Creates order from cart, clears cart, initiates payment |

**Payment Methods:**

| Method | Implementation |
|---|---|
| Credit / Debit Card | Mock card payment handler |
| Cash on Delivery | Order placed without payment intent |
| Wallet | Deduct from user's mock wallet balance |

---

### 6.4 Order Management

**Order Model:** `user`, `seller`, `items[]`, `shippingAddress`, `paymentMethod`, `paymentStatus`, `orderStatus`, `trackingNumber`, `timeline[]`, `totalAmount`, `discount`, `notes`

**Order Statuses:**

```
Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered
                    ↘ Cancelled (by user or seller)
                    ↘ Refunded
                    ↘ Failed
```

| Feature | Details |
|---|---|
| Place Order | Validates cart, reserves stock, creates payment intent |
| Status Tracking | Full timeline with timestamps |
| Cancel Order | Only in Pending/Confirmed states; refund triggered |
| Email Notifications | Sent on status change (see §12) |
| Admin Override | Admin can force any status |

---

### 6.5 Payment Integration

All payment methods are handled server-side with no external payment gateway dependency.

**Supported Methods:**

| Method | Flow |
|---|---|
| **Credit / Debit Card** | Card details collected on frontend → sent to server → mock validation → order marked as paid |
| **Cash on Delivery** | Order placed immediately, `paymentStatus = 'pending'` until delivery |
| **Wallet** | Server deducts from user's mock wallet balance → order confirmed instantly |

| Endpoint | Method | Description |
|---|---|---|
| `/payment/card/pay` | POST | Mock card payment handler |
| `/payment/wallet/pay` | POST | Pay using wallet balance |
| `/payment/cod` | POST | Place cash on delivery order |

---

### 6.6 Admin Panel APIs

All routes prefixed with `/admin` and protected by `authorize('admin')`.

| Resource | Operations |
|---|---|
| Users | List (paginated), view, approve, restrict, delete |
| Sellers | List, approve/reject application, suspend |
| Products | List all, approve listing, remove any product |
| Categories | Full CRUD |
| Orders | List all, update status, assign tracking |
| Promo Codes | Create, toggle active, set usage limits & expiry |
| Discounts | Bulk discounts by category or seller |
| Banners | CRUD for homepage hero banners (title, image, link, order) |
| Analytics (bonus) | Basic stats: revenue, orders today, new users |

---

### 6.7 Seller / Vendor Features

**Seller Profile Model:** `user`, `brandName`, `logo`, `bio`, `bankDetails{}`, `isApproved`, `totalEarnings`, `pendingPayout`, `rating`

| Feature | Details |
|---|---|
| Seller Registration | Extends user account; requires admin approval |
| Product Management | Full CRUD on own products only |
| Inventory | View low-stock alerts (stock < threshold) |
| Order Processing | View orders containing their products; update fulfillment |
| Earnings Dashboard | Gross revenue, net after platform fee, pending payout |
| Payout (Mock) | Request payout; admin marks as paid |

---

## 7. Authentication & Authorization

### JWT Strategy

```
Access Token  → short-lived (15 min), sent in Authorization header
Refresh Token → long-lived (7 days), stored in httpOnly cookie + DB
```

On every protected request:
1. `auth.middleware.js` extracts and verifies access token
2. Attaches `req.user` with `{ id, role, sellerId? }`
3. `authorize(...roles)` middleware checks `req.user.role`

### Role Hierarchy

```
admin > seller > customer
```

A seller also has `customer` privileges; admin has all privileges.

---

## 8. Security

| Measure | Tool / Approach |
|---|---|
| Password hashing | bcryptjs, 12 rounds |
| JWT signing | RS256 or HS256 with strong secrets |
| Rate limiting | express-rate-limit (100 req / 15 min per IP) |
| Brute-force protection | Stricter limiter on `/auth/*` (10 req / 15 min) |
| Input sanitization | mongo-sanitize (NoSQL injection), xss-clean (XSS) |
| HTTP headers | Helmet.js |
| CORS | Whitelist of allowed origins |
| Sensitive fields | `password`, `refreshToken`, `bankDetails` excluded from all API responses via Mongoose `.select('-password')` or DTO mapping |
| File uploads | MIME type + size validation; Cloudinary does final storage |

---

## 9. Validation Strategy

All incoming data is validated via **Zod** in a `validate.middleware.js` that wraps each schema.

```js
// Example: product creation schema
export const createProductSchema = z.object({
  body: z.object({
    title:       z.string().min(3).max(200),
    price:       z.number().positive(),
    salePrice:   z.number().positive().optional(),
    stock:       z.number().int().nonnegative(),
    category:    z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"),
    description: z.string().min(10).max(5000),
  }),
});
```

Schemas live in `module.schema.js`. The middleware parses `body`, `params`, and `query` and returns a structured 422 error on failure.

---

## 10. Error Handling

### `AppError` Class

```js
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;            // e.g. "PRODUCT_NOT_FOUND"
    this.isOperational = true;
  }
}
```

### Centralized Error Handler

`errorHandler.middleware.js` catches everything:

```
Operational Errors (AppError)  → return JSON with message + code
Mongoose ValidationError       → 422, formatted field errors
Mongoose CastError (bad ID)    → 400 "Invalid ID"
JWT errors                     → 401
Duplicate key (code 11000)     → 409 "Already exists"
Unhandled / Programming errors → 500, log full stack (never expose in prod)
```

---

## 11. Pagination, Filtering & Sorting

All list endpoints accept these query parameters:

| Param | Example | Default |
|---|---|---|
| `page` | `?page=2` | 1 |
| `limit` | `?limit=20` | 20 (max 100) |
| `sort` | `?sort=-price,createdAt` | `-createdAt` |
| `fields` | `?fields=title,price,images` | all |
| `search` | `?search=wireless+headphones` | — |
| `minPrice` | `?minPrice=50` | — |
| `maxPrice` | `?maxPrice=500` | — |
| `category` | `?category=electronics` | — |
| `rating` | `?rating=4` | — |
| `inStock` | `?inStock=true` | — |

The `paginate.js` utility builds the Mongoose query and returns the standardized `meta` object.

---

## 12. Email Notifications

Nodemailer is used with a **mock SMTP** (Mailtrap) in development and real SMTP in production.

| Trigger | Template |
|---|---|
| Registration | Welcome + email verification link |
| Email verification | Confirm your account |
| Password reset | Reset link (expires in 1 hour) |
| Order placed | Order confirmation with summary |
| Order confirmed | Seller accepted the order |
| Order shipped | With tracking number |
| Order delivered | Delivery confirmation |
| Order cancelled | With refund details |
| Seller approved | Account is live |
| Payout processed | Payout confirmation (mock) |

Templates are HTML files in `src/modules/notification/templates/`.

---

## 13. API Documentation (Swagger)

Swagger UI is served at **`GET /api-docs`**.

Setup in `config/swagger.js` using `swagger-jsdoc` + `swagger-ui-express`:

```js
const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "E-Commerce API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.js"],
};
```

Each route file uses JSDoc `@swagger` annotations. APIs are grouped by tag: `Auth`, `Users`, `Products`, `Cart`, `Orders`, `Payment`, `Admin`, `Seller`.

---

## 14. Setup Instructions

### Prerequisites

- Node.js ≥ 20 LTS
- MongoDB ≥ 6 (local or Atlas)
- A Mailtrap account (or any SMTP)

### Steps

```bash

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in all required values in .env

# 3. Seed the database (optional)
npm run seed

# 4. Start in development mode (nodemon)
npm run dev

# 5. Start in production mode
npm start
```

The server starts at `http://localhost:5000`.  
Swagger UI: `http://localhost:5000/api-docs`

---
## 16. Logging

| Logger | Purpose |
|---|---|
| **Morgan** | HTTP request logging (method, URL, status, response time) |
| **Winston** | Application-level structured logging |

Winston transports:
- `Console` — colorized in development
- `File (error.log)` — errors only
- `File (combined.log)` — all levels

Log levels: `error > warn > info > http > debug`

In production (`NODE_ENV=production`) the log level is `warn`; in development it is `debug`.

---

## 17. Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific module
npm test -- --testPathPattern=user
```

### Unit Tests (Jest)

- Services — mock repository methods, assert business logic
- Utils — `paginate`, `token`, `AppError`
- Zod schemas — valid and invalid inputs

### Integration Tests (Supertest)

- Auth flow (register → verify → login → refresh → logout)
- Product CRUD with role guards
- Cart → Checkout → Order lifecycle

### Coverage Target

- Statements: ≥ 80 %
- Branches: ≥ 75 %
- Functions: ≥ 80 %

---

## 18. Seed Data

```bash
npm run seed
```

Creates:
- 1 Admin user (`admin@eshop.com` / `Admin123!`)
- 3 Seller accounts with brand profiles
- 10 Customer accounts
- 8 Top-level categories + 24 subcategories
- 60 Products across categories with images (Cloudinary URLs)
- 5 Active promo codes
- Sample orders in various statuses
- 2 Homepage banners

```bash
# Reset and re-seed
npm run seed:fresh
```

---

## 19. Roles & Permissions

| Permission | Customer | Seller | Admin |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| View products | ✅ | ✅ | ✅ |
| Manage cart | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ |
| Write reviews | ✅ (purchased only) | ✅ | ✅ |
| Manage wishlist | ✅ | ✅ | ✅ |
| Create products | ❌ | ✅ (own) | ✅ |
| Manage inventory | ❌ | ✅ (own) | ✅ |
| Process orders | ❌ | ✅ (own) | ✅ |
| View earnings | ❌ | ✅ (own) | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| Manage all products | ❌ | ❌ | ✅ |
| Approve sellers | ❌ | ❌ | ✅ |
| Manage promo codes | ❌ | ❌ | ✅ |
| Manage banners | ❌ | ❌ | ✅ |
| Access analytics | ❌ | ❌ | ✅ |

---

## 20. Authentication Flow

```
┌─────────────┐                          ┌──────────────┐
│   Client    │                          │    Server    │
└──────┬──────┘                          └──────┬───────┘
       │  POST /auth/register                   │
       │──────────────────────────────────────> │
       │                                        │ Hash password (bcrypt)
       │                                        │ Save user (isVerified=false)
       │                                        │ Send verification email
       │  201 { message: "Check your email" }   │
       │<────────────────────────────────────── │
       │                                        │
       │  GET /auth/verify-email?token=xxx      │
       │──────────────────────────────────────> │
       │                                        │ Verify token, set isVerified=true
       │  200 { message: "Email verified" }     │
       │<────────────────────────────────────── │
       │                                        │
       │  POST /auth/login { email, password }  │
       │──────────────────────────────────────> │
       │                                        │ Compare hash
       │                                        │ Sign accessToken (15m)
       │                                        │ Sign refreshToken (7d)
       │                                        │ Store refreshToken in DB
       │  200 { accessToken }                   │
       │  Set-Cookie: refreshToken (httpOnly)   │
       │<────────────────────────────────────── │
       │                                        │
       │  GET /products (Authorization: Bearer) │
       │──────────────────────────────────────> │
       │                                        │ Verify accessToken
       │                                        │ Attach req.user
       │  200 { data: [...] }                   │
       │<────────────────────────────────────── │
       │                                        │
       │  POST /auth/refresh (cookie)           │
       │──────────────────────────────────────> │
       │                                        │ Verify refreshToken vs DB
       │                                        │ Issue new accessToken
       │  200 { accessToken }                   │
       │<────────────────────────────────────── │
       │                                        │
       │  POST /auth/logout                     │
       │──────────────────────────────────────> │
       │                                        │ Delete refreshToken from DB
       │                                        │ Clear cookie
       │  200 { message: "Logged out" }         │
       │<────────────────────────────────────── │
```

---

## 21. API Endpoint Reference

> Base URL: `http://localhost:5000/api/v1`  
> Auth: `Authorization: Bearer <accessToken>` for protected routes

### Auth

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password, phone? }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/refresh` | Cookie | — |
| POST | `/auth/logout` | ✅ | — |
| GET | `/auth/verify-email` | — | `?token=xxx` |
| POST | `/auth/forgot-password` | — | `{ email }` |
| PATCH | `/auth/reset-password` | — | `{ token, newPassword }` |

### Users

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/users/me` | ✅ | Any |
| PATCH | `/users/me` | ✅ | Any |
| PATCH | `/users/me/avatar` | ✅ | Any |
| GET | `/users/me/wishlist` | ✅ | Customer |
| POST | `/users/me/wishlist/:productId` | ✅ | Customer |
| DELETE | `/users/me/wishlist/:productId` | ✅ | Customer |
| GET | `/users/me/orders` | ✅ | Customer |
| GET | `/users/me/reviews` | ✅ | Any |

### Products

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/products` | — | — |
| GET | `/products/:id` | — | — |
| POST | `/products` | ✅ | Seller/Admin |
| PATCH | `/products/:id` | ✅ | Seller (own)/Admin |
| DELETE | `/products/:id` | ✅ | Seller (own)/Admin |
| POST | `/products/:id/images` | ✅ | Seller (own)/Admin |

### Categories

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/categories` | — | — |
| GET | `/categories/:slug/products` | — | — |
| POST | `/categories` | ✅ | Admin |
| PATCH | `/categories/:id` | ✅ | Admin |
| DELETE | `/categories/:id` | ✅ | Admin |

### Cart

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/cart` | Optional | Guest via `sessionId` header |
| POST | `/cart/items` | Optional | `{ productId, quantity }` |
| PATCH | `/cart/items/:productId` | Optional | `{ quantity }` |
| DELETE | `/cart/items/:productId` | Optional | — |
| POST | `/cart/coupon` | Optional | `{ code }` |
| DELETE | `/cart/coupon` | Optional | — |
| GET | `/cart/summary` | Optional | Detailed breakdown |

### Orders

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/orders` | ✅ | Customer |
| GET | `/orders/:id` | ✅ | Owner/Seller/Admin |
| POST | `/orders/:id/cancel` | ✅ | Customer (pending only) |
| PATCH | `/orders/:id/status` | ✅ | Seller/Admin |

### Payment

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/payment/card/pay` | ✅ | Mock card payment |
| POST | `/payment/wallet/pay` | ✅ | Mock wallet |
| POST | `/payment/cod` | ✅ | Cash on delivery |

### Reviews

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/products/:id/reviews` | — | — |
| POST | `/products/:id/reviews` | ✅ | Must have purchased |
| PATCH | `/reviews/:id` | ✅ | Owner only |
| DELETE | `/reviews/:id` | ✅ | Owner/Admin |

### Seller

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/seller/register` | ✅ | Customer |
| GET | `/seller/profile` | ✅ | Seller |
| PATCH | `/seller/profile` | ✅ | Seller |
| GET | `/seller/products` | ✅ | Seller |
| GET | `/seller/orders` | ✅ | Seller |
| GET | `/seller/earnings` | ✅ | Seller |
| POST | `/seller/payout/request` | ✅ | Seller |

### Admin

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/admin/users` | ✅ | Admin |
| PATCH | `/admin/users/:id/status` | ✅ | Admin |
| GET | `/admin/sellers` | ✅ | Admin |
| PATCH | `/admin/sellers/:id/approve` | ✅ | Admin |
| GET | `/admin/orders` | ✅ | Admin |
| GET | `/admin/promo-codes` | ✅ | Admin |
| POST | `/admin/promo-codes` | ✅ | Admin |
| PATCH | `/admin/promo-codes/:id` | ✅ | Admin |
| GET | `/admin/banners` | ✅ | Admin |
| POST | `/admin/banners` | ✅ | Admin |
| PATCH | `/admin/banners/:id` | ✅ | Admin |
| DELETE | `/admin/banners/:id` | ✅ | Admin |
| GET | `/admin/analytics` | ✅ | Admin |

---

## 22. Additions & Enhancements

The following features go **beyond the original requirements** and are recommended for production-readiness:

### 🔄 Refresh Token Rotation
Each refresh generates a new refresh token and invalidates the previous one — prevents token theft replay attacks.

### 🔐 Account Lockout
After 5 failed login attempts within 15 minutes, the account is temporarily locked and an unlock email is sent.

### 📦 Multi-Vendor Order Splitting
When a cart contains products from multiple sellers, a single customer order is **automatically split** into sub-orders per seller. Each seller sees and manages only their slice.

### 💬 Q&A on Products
Customers can post questions on product pages; sellers and admins can post answers. Fully threaded.

### 🏷️ Flash Sales / Time-Limited Pricing
Products can have a `salePrice` + `saleEndsAt` field. A scheduled cron job (node-cron) resets expired sale prices.

### 📊 Admin Analytics Endpoint
Basic dashboard stats: total revenue (today / this month), order counts by status, new user registrations, top-selling products, low-stock alerts.

### 🌍 Multi-Currency Support (Structure)
`currency` field on products and orders; a `currencyRate` config collection for admin to manage exchange rates. Conversion logic in a utility — ready to plug in a live exchange rate API.

### 🔔 In-App Notification Model
A `notifications` collection stores alerts (order status change, seller approval, payout, etc.). `GET /notifications` with unread count and mark-as-read endpoint — ready for WebSocket push (Socket.IO) later.

### 🗂️ Soft Deletes
Users and products use `deletedAt` instead of hard deletion, keeping referential integrity in orders and reviews. A global Mongoose plugin handles this transparently.

### 🧪 CI/CD Pipeline (GitHub Actions)
`.github/workflows/ci.yml` runs ESLint, Jest tests, and Docker build on every PR against `main`.

### 🌐 API Versioning
All routes live under `/api/v1/`. Future breaking changes are introduced under `/api/v2/` without disrupting existing integrations.

### 📑 Request ID Tracing
Each request is assigned a `X-Request-ID` (UUID v4) in middleware. This ID is attached to all logs for that request — making distributed tracing straightforward.

---

*Specification version: 1.0 — Last updated: 2025*