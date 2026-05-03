const cartService = require('./cart.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getSessionId = (req) => req.headers['x-session-id'] || null;
const getUserId = (req) => req.user?.id || null;

exports.getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(getUserId(req), getSessionId(req));
  ApiResponse.success(res, 200, 'Cart fetched', result);
});

exports.addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(getUserId(req), getSessionId(req), req.body);
  ApiResponse.success(res, 200, 'Item added to cart', cart);
});

exports.updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(getUserId(req), getSessionId(req), req.params.productId, req.body.quantity);
  ApiResponse.success(res, 200, 'Cart updated', cart);
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(getUserId(req), getSessionId(req), req.params.productId);
  ApiResponse.success(res, 200, 'Item removed from cart', cart);
});

exports.applyCoupon = asyncHandler(async (req, res) => {
  const result = await cartService.applyCoupon(getUserId(req), getSessionId(req), req.body.code);
  ApiResponse.success(res, 200, result.message, result.promo);
});

exports.removeCoupon = asyncHandler(async (req, res) => {
  const result = await cartService.removeCoupon(getUserId(req), getSessionId(req));
  ApiResponse.success(res, 200, result.message);
});

exports.getCartSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.getCartSummary(getUserId(req), getSessionId(req));
  ApiResponse.success(res, 200, 'Cart summary', summary);
});
