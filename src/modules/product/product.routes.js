const express = require('express');
const router = express.Router();
const controller = require('./product.controller');
const reviewController = require('../review/review.controller');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const upload = require('../../middlewares/upload.middleware');
const { createProductSchema, updateProductSchema, productQuerySchema } = require('./product.schema');

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product catalog management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with filtering and pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Products list }
 */
router.get('/', validate(productQuerySchema), controller.getAll);
router.get('/featured', controller.getFeatured);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product data }
 *       404: { description: Not found }
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (Seller / Admin)
 *     responses:
 *       201: { description: Product created }
 */
router.post('/', authenticate, authorize('seller', 'admin'), validate(createProductSchema), controller.create);
router.patch('/:id', authenticate, authorize('seller', 'admin'), validate(updateProductSchema), controller.update);
router.delete('/:id', authenticate, authorize('seller', 'admin'), controller.delete);
router.post('/:id/images', authenticate, authorize('seller', 'admin'), upload.array('images', 8), controller.addImages);

// Product reviews (nested)
router.get('/:id/reviews', reviewController.getProductReviews);
router.post('/:id/reviews', authenticate, reviewController.create);

module.exports = router;
