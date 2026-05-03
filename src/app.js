require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const sanitizeInputs = require('./middlewares/sanitize.middleware');
const requestId = require('./middlewares/requestId.middleware');
const logger = require('./utils/logger');

// Module routes
const userRoutes = require('./modules/user/user.routes');
const categoryRoutes = require('./modules/category/category.routes');
const productRoutes = require('./modules/product/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/order/order.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const reviewRoutes = require('./modules/review/review.routes');
const sellerRoutes = require('./modules/seller/seller.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const promoRoutes = require('./modules/promo/promo.routes');
const bannerRoutes = require('./modules/banner/banner.routes');

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// ── Request tracing ──────────────────────────────────────────────────────────
app.use(requestId);

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: () => env.NODE_ENV === 'test',
  })
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Input sanitization ───────────────────────────────────────────────────────
app.use(sanitizeInputs);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mercado API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const BASE = '/api/v1';

app.use(BASE, userRoutes);
app.use(`${BASE}/categories`, categoryRoutes);
app.use(`${BASE}/products`, productRoutes);
app.use(`${BASE}/cart`, cartRoutes);
app.use(`${BASE}/orders`, orderRoutes);
app.use(`${BASE}/payment`, paymentRoutes);
app.use(`${BASE}/reviews`, reviewRoutes);
app.use(`${BASE}/seller`, sellerRoutes);
app.use(`${BASE}/admin`, adminRoutes);
app.use(`${BASE}/promo`, promoRoutes);
app.use(`${BASE}/banners`, bannerRoutes);

// ── Swagger UI ────────────────────────────────────────────────────────────────
setupSwagger(app);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;