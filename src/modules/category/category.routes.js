const express = require('express');
const router = express.Router();
const controller = require('./category.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('./category.schema');

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all top-level categories (with children)
 *     security: []
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (Admin only)
 *     responses:
 *       201: { description: Category created }
 */
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), controller.create);
router.patch('/:id', authenticate, authorize('admin'), validate(updateCategorySchema), controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

module.exports = router;
