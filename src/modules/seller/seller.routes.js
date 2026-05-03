const express = require('express');
const router = express.Router();
const controller = require('./seller.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { registerSellerSchema, updateSellerSchema, payoutRequestSchema } = require('./seller.schema');

/**
 * @swagger
 * tags:
 *   - name: Seller
 *     description: Seller/Vendor portal
 */

// Any authenticated user can register as seller
router.post('/register', authenticate, validate(registerSellerSchema), controller.register);

// Seller-only routes
router.get('/profile', authenticate, authorize('seller', 'admin'), controller.getProfile);
router.patch('/profile', authenticate, authorize('seller', 'admin'), validate(updateSellerSchema), controller.updateProfile);
router.get('/products', authenticate, authorize('seller', 'admin'), controller.getProducts);
router.get('/inventory/low-stock', authenticate, authorize('seller', 'admin'), controller.getLowStock);
router.get('/orders', authenticate, authorize('seller', 'admin'), controller.getOrders);
router.get('/earnings', authenticate, authorize('seller', 'admin'), controller.getEarnings);
router.post('/payout/request', authenticate, authorize('seller', 'admin'), validate(payoutRequestSchema), controller.requestPayout);

module.exports = router;
