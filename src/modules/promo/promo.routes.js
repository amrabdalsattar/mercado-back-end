const express = require('express');
const router = express.Router();
const controller = require('./promo.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createPromoSchema, updatePromoSchema } = require('./promo.schema');

router.post('/validate', authenticate, controller.validate);

// Admin only
router.get('/', authenticate, authorize('admin'), controller.getAll);
router.post('/', authenticate, authorize('admin'), validate(createPromoSchema), controller.create);
router.patch('/:id', authenticate, authorize('admin'), validate(updatePromoSchema), controller.update);

module.exports = router;
