const categoryService = require('./category.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAll();
  ApiResponse.success(res, 200, 'Categories fetched', categories);
});

exports.getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  ApiResponse.success(res, 200, 'Category fetched', category);
});

exports.create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  ApiResponse.success(res, 201, 'Category created', category);
});

exports.update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  ApiResponse.success(res, 200, 'Category updated', category);
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await categoryService.delete(req.params.id);
  ApiResponse.success(res, 200, result.message);
});
