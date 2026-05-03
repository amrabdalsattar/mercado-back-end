const express = require('express');
const router = express.Router();
const controller = require('./banner.controller');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createBannerSchema, updateBannerSchema } = require('./banner.schema');

/**
 * @swagger
 * tags:
 *   - name: Banners
 *     description: Homepage banner management
 */

router.get('/', optionalAuth, controller.getAll);
router.post('/', authenticate, authorize('admin'), upload.single('image'), validate(createBannerSchema), controller.create);
router.patch('/:id', authenticate, authorize('admin'), validate(updateBannerSchema), controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

module.exports = router;
