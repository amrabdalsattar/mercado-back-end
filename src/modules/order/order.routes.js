const express = require('express');
const router = express.Router();
const controller = require('./order.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { placeOrderSchema, updateOrderStatusSchema } = require('./order.schema');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order lifecycle management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order from cart
 *     responses:
 *       201: { description: Order placed }
 */
router.post('/', authenticate, validate(placeOrderSchema), controller.placeOrder);
router.get('/my', authenticate, controller.getMyOrders);
router.get('/:id', authenticate, controller.getById);
router.post('/:id/cancel', authenticate, controller.cancelOrder);
router.patch('/:id/status', authenticate, authorize('seller', 'admin'), validate(updateOrderStatusSchema), controller.updateStatus);

module.exports = router;
