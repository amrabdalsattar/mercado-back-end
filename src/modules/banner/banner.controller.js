const bannerService = require('./banner.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const banners = await bannerService.getAll(req.user?.role === 'admin');
  ApiResponse.success(res, 200, 'Banners fetched', banners);
});

exports.create = asyncHandler(async (req, res) => {
  if (!req.file) return ApiResponse.error(res, 400, 'Image required', 'NO_FILE');
  const banner = await bannerService.create(req.body, req.file.path);
  ApiResponse.success(res, 201, 'Banner created', banner);
});

exports.update = asyncHandler(async (req, res) => {
  const banner = await bannerService.update(req.params.id, req.body);
  ApiResponse.success(res, 200, 'Banner updated', banner);
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await bannerService.delete(req.params.id);
  ApiResponse.success(res, 200, result.message);
});
