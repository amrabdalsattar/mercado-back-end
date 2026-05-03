const promoService = require('./promo.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const promos = await promoService.getAll();
  ApiResponse.success(res, 200, 'Promo codes fetched', promos);
});

exports.create = asyncHandler(async (req, res) => {
  const promo = await promoService.create(req.body);
  ApiResponse.success(res, 201, 'Promo code created', promo);
});

exports.update = asyncHandler(async (req, res) => {
  const promo = await promoService.update(req.params.id, req.body);
  ApiResponse.success(res, 200, 'Promo code updated', promo);
});

exports.validate = asyncHandler(async (req, res) => {
  const promo = await promoService.validate(req.body.code);
  ApiResponse.success(res, 200, 'Promo code valid', promo);
});
