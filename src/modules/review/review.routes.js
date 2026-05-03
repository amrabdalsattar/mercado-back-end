const express = require('express');
const router = express.Router();
const controller = require('./review.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { updateReviewSchema } = require('./review.schema');

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Product reviews
 */

router.patch('/:id', authenticate, validate(updateReviewSchema), controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;
