# 🛒 Mercado Backend API

> Production-ready Node.js + Express REST API for a multi-vendor e-commerce platform.

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen)](https://mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20 LTS
- MongoDB ≥ 6 (local or Atlas)
- A Mailtrap account (or any SMTP for email)
- A Cloudinary account (for image uploads)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in all required values in .env
```

### 3. Start development server
```bash
npm run dev
```

### 4. Seed the database (optional but recommended)
```bash
npm run seed
```

> Server: `http://localhost:5000`  
> Swagger UI: `http://localhost:5000/api-docs`  
> Health check: `http://localhost:5000/health`

---

## 🐳 Docker

```bash
# Build and run with Docker Compose (API + MongoDB)
docker-compose up -d

# Stop
docker-compose down
```

---

## 📋 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm run seed` | Seed database with demo data |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🌐 API Base URL

```
http://localhost:5000/api/v1
```

All responses follow the standardized shape:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 350, "totalPages": 18 }
}
```

---

## 🗂️ Module Overview

| Module | Prefix | Description |
|---|---|---|
| Auth + Users | `/api/v1/auth`, `/api/v1/users` | Registration, login, JWT, profile |
| Products | `/api/v1/products` | CRUD, search, filtering, pagination |
| Categories | `/api/v1/categories` | Nested category management |
| Cart | `/api/v1/cart` | Guest + authenticated cart |
| Orders | `/api/v1/orders` | Order lifecycle with timeline |
| Payment | `/api/v1/payment` | Mock card, wallet & COD |
| Reviews | `/api/v1/reviews` | Product reviews |
| Seller | `/api/v1/seller` | Vendor portal |
| Admin | `/api/v1/admin` | Full admin panel APIs |
| Promo | `/api/v1/promo` | Promo code management |
| Banners | `/api/v1/banners` | Homepage banners |

---

## 🔐 Authentication

```
Authorization: Bearer <accessToken>
```

Access tokens expire in **15 minutes**. Use `POST /api/v1/auth/refresh` (with the `refreshToken` cookie) to get a new pair.

### Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@mercado.com | Admin123! |
| Seller | alice@mercado.com | Seller123! |
| Customer | customer1@mercado.com | Customer123! |

---

## 🏗️ Architecture

```
Request → Router → Controller → Service → Repository → Model
                               ↓
                          Business Logic
```

- **Feature-based modules** — each domain is self-contained
- **SOLID principles** throughout service and repository layers  
- **Zod validation** on all incoming requests  
- **JWT access + refresh token rotation**  
- **Soft deletes** for users and products  

---

## 📖 API Documentation

Interactive Swagger UI at **`/api-docs`** after starting the server.

---

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

Tests live in `tests/unit/` and `tests/integration/`.

---

## 🔒 Security Features

- Helmet.js HTTP headers
- CORS with origin whitelist
- Express Rate Limiting (100 req/15min; 10 req/15min on auth routes)
- MongoDB sanitization (NoSQL injection protection)
- XSS-clean input sanitization
- bcrypt password hashing (12 rounds)
- Account lockout after 5 failed login attempts
- Refresh token rotation
- Sensitive fields excluded from all API responses
