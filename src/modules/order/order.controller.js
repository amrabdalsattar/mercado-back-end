const orderService = require('./order.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.id, req.body, req.headers['x-session-id']);
  ApiResponse.success(res, 201, 'Order placed successfully', order);
});

exports.getById = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id, req.user);
  ApiResponse.success(res, 200, 'Order fetched', order);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  ApiResponse.success(res, 200, 'Orders fetched', orders);
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);
  ApiResponse.success(res, 200, 'Order cancelled', order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body, req.user);
  ApiResponse.success(res, 200, 'Order status updated', order);
});
