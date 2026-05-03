const productService = require('./product.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.getAll(req.query);
  ApiResponse.success(res, 200, 'Products fetched', products, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  ApiResponse.success(res, 200, 'Product fetched', product);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.user.id);
  ApiResponse.success(res, 201, 'Product created', product);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.user);
  ApiResponse.success(res, 200, 'Product updated', product);
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await productService.delete(req.params.id, req.user);
  ApiResponse.success(res, 200, result.message);
});

exports.addImages = asyncHandler(async (req, res) => {
  const imageUrls = req.files?.map((f) => f.path) || [];
  const product = await productService.addImages(req.params.id, req.user, imageUrls);
  ApiResponse.success(res, 200, 'Images uploaded', product);
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const products = await productService.getFeatured();
  ApiResponse.success(res, 200, 'Featured products fetched', products);
});
