const express = require('express');
const router = express.Router();
const controller = require('./cart.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { addItemSchema, updateItemSchema, applyCouponSchema } = require('./cart.schema');

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart management
 */

router.get('/', optionalAuth, controller.getCart);
router.get('/summary', optionalAuth, controller.getCartSummary);
router.post('/items', optionalAuth, validate(addItemSchema), controller.addItem);
router.patch('/items/:productId', optionalAuth, validate(updateItemSchema), controller.updateItem);
router.delete('/items/:productId', optionalAuth, controller.removeItem);
router.post('/coupon', optionalAuth, validate(applyCouponSchema), controller.applyCoupon);
router.delete('/coupon', optionalAuth, controller.removeCoupon);

module.exports = router;
