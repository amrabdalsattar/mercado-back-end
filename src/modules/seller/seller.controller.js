const sellerService = require('./seller.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const seller = await sellerService.register(req.user.id, req.body);
  ApiResponse.success(res, 201, 'Seller application submitted. Awaiting admin approval.', seller);
});

exports.getProfile = asyncHandler(async (req, res) => {
  const seller = await sellerService.getProfile(req.user.id);
  ApiResponse.success(res, 200, 'Seller profile fetched', seller);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const seller = await sellerService.updateProfile(req.user.id, req.body);
  ApiResponse.success(res, 200, 'Seller profile updated', seller);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await sellerService.getSellerProducts(req.user.id);
  ApiResponse.success(res, 200, 'Seller products fetched', products);
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await sellerService.getSellerOrders(req.user.id);
  ApiResponse.success(res, 200, 'Seller orders fetched', orders);
});

exports.getEarnings = asyncHandler(async (req, res) => {
  const earnings = await sellerService.getEarnings(req.user.id);
  ApiResponse.success(res, 200, 'Earnings fetched', earnings);
});

exports.requestPayout = asyncHandler(async (req, res) => {
  const seller = await sellerService.requestPayout(req.user.id, req.body.amount);
  ApiResponse.success(res, 200, 'Payout requested', seller);
});

exports.getLowStock = asyncHandler(async (req, res) => {
  const products = await sellerService.getLowStockAlerts(req.user.id, req.query.threshold);
  ApiResponse.success(res, 200, 'Low stock alerts', products);
});
