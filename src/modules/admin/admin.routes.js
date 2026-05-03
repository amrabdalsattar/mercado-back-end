const express = require('express');
const router = express.Router();
const controller = require('./admin.controller');
const promoController = require('../promo/promo.controller');
const bannerController = require('../banner/banner.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const upload = require('../../middlewares/upload.middleware');
const { createPromoSchema, updatePromoSchema } = require('../promo/promo.schema');
const { createBannerSchema, updateBannerSchema } = require('../banner/banner.schema');

const adminGuard = [authenticate, authorize('admin')];

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin panel — protected by admin role
 */

// ── Users ──────────────────────────────────────────────────────────────────────
router.get('/users', ...adminGuard, controller.listUsers);
router.patch('/users/:id/status', ...adminGuard, controller.updateUserStatus);
router.delete('/users/:id', ...adminGuard, controller.deleteUser);

// ── Sellers ────────────────────────────────────────────────────────────────────
router.get('/sellers', ...adminGuard, controller.listSellers);
router.patch('/sellers/:id/approve', ...adminGuard, controller.approveSeller);

// ── Orders ─────────────────────────────────────────────────────────────────────
router.get('/orders', ...adminGuard, controller.listOrders);

// ── Promo Codes ────────────────────────────────────────────────────────────────
router.get('/promo-codes', ...adminGuard, promoController.getAll);
router.post('/promo-codes', ...adminGuard, validate(createPromoSchema), promoController.create);
router.patch('/promo-codes/:id', ...adminGuard, validate(updatePromoSchema), promoController.update);

// ── Banners ────────────────────────────────────────────────────────────────────
router.get('/banners', ...adminGuard, controller.listBanners);
router.post('/banners', ...adminGuard, upload.single('image'), validate(createBannerSchema), bannerController.create);
router.patch('/banners/:id', ...adminGuard, validate(updateBannerSchema), bannerController.update);
router.delete('/banners/:id', ...adminGuard, bannerController.delete);

// ── Analytics ──────────────────────────────────────────────────────────────────
router.get('/analytics', ...adminGuard, controller.getAnalytics);

module.exports = router;
