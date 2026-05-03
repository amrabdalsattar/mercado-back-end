const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const validate = require('../../middlewares/validate.middleware');
const upload = require('../../middlewares/upload.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require('./user.schema');

// ── Auth Routes ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Users
 *     description: User profile & account management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 */
router.post('/auth/register', authLimiter, validate(registerSchema), controller.register);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email with token from email link
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email verified }
 */
router.get('/auth/verify-email', controller.verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
router.post('/auth/login', authLimiter, validate(loginSchema), controller.login);
router.post('/auth/refresh', controller.refresh);
router.post('/auth/logout', authenticate, controller.logout);
router.post('/auth/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.patch('/auth/reset-password', validate(resetPasswordSchema), controller.resetPassword);

// ── User Routes ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200: { description: Profile data }
 */
router.get('/users/me', authenticate, controller.getMe);
router.patch('/users/me', authenticate, validate(updateProfileSchema), controller.updateMe);
router.patch('/users/me/avatar', authenticate, upload.single('avatar'), controller.updateAvatar);

router.get('/users/me/wishlist', authenticate, controller.getWishlist);
router.post('/users/me/wishlist/:productId', authenticate, controller.addToWishlist);
router.delete('/users/me/wishlist/:productId', authenticate, controller.removeFromWishlist);

module.exports = router;
