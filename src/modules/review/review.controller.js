const reviewService = require('./review.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.id);
  ApiResponse.success(res, 200, 'Reviews fetched', reviews);
});

exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.create(req.params.id, req.user.id, req.body);
  ApiResponse.success(res, 201, 'Review submitted', review);
});

exports.update = asyncHandler(async (req, res) => {
  const review = await reviewService.update(req.params.id, req.user.id, req.body);
  ApiResponse.success(res, 200, 'Review updated', review);
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await reviewService.delete(req.params.id, req.user);
  ApiResponse.success(res, 200, result.message);
});
