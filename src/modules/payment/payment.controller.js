const paymentService = require('./payment.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.cardPay = asyncHandler(async (req, res) => {
  const result = await paymentService.cardPay(req.user.id, req.body);
  ApiResponse.success(res, 200, result.message, result);
});

exports.walletPay = asyncHandler(async (req, res) => {
  const result = await paymentService.walletPay(req.user.id, req.body);
  ApiResponse.success(res, 200, result.message, result);
});

exports.codOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.codOrder(req.user.id, req.body);
  ApiResponse.success(res, 200, result.message, result);
});
