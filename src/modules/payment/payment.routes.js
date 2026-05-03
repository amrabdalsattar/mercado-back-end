const express = require('express');
const router = express.Router();
const controller = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: Payment processing
 */

/**
 * @swagger
 * /payment/card/pay:
 *   post:
 *     tags: [Payment]
 *     summary: Pay with credit/debit card (mock)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, cardNumber, expiryMonth, expiryYear, cvv]
 *             properties:
 *               orderId: { type: string }
 *               cardNumber: { type: string }
 *               expiryMonth: { type: string }
 *               expiryYear: { type: string }
 *               cvv: { type: string }
 *     responses:
 *       200: { description: Payment successful }
 */
router.post('/card/pay', authenticate, controller.cardPay);
router.post('/wallet/pay', authenticate, controller.walletPay);
router.post('/cod', authenticate, controller.codOrder);

module.exports = router;
