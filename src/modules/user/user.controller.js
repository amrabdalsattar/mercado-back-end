const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// ─── Auth ────────────────────────────────────────────────────────────────────

exports.register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  ApiResponse.success(res, 201, result.message);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const result = await userService.verifyEmail(req.query.token);
  ApiResponse.success(res, 200, result.message);
});

exports.login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await userService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiResponse.success(res, 200, 'Login successful', { accessToken, user });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await userService.refresh(req.cookies.refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, 200, 'Token refreshed', { accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  await userService.logout(req.user.id);
  res.clearCookie('refreshToken');
  ApiResponse.success(res, 200, 'Logged out successfully');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await userService.forgotPassword(req.body.email);
  ApiResponse.success(res, 200, result.message);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await userService.resetPassword(req.body);
  ApiResponse.success(res, 200, result.message);
});

// ─── Profile ─────────────────────────────────────────────────────────────────

exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  ApiResponse.success(res, 200, 'Profile fetched', user);
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  ApiResponse.success(res, 200, 'Profile updated', user);
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 400, 'No image uploaded', 'NO_FILE');
  }
  const user = await userService.updateAvatar(req.user.id, req.file.path);
  ApiResponse.success(res, 200, 'Avatar updated', user);
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user.id);
  ApiResponse.success(res, 200, 'Wishlist fetched', wishlist);
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const result = await userService.addToWishlist(req.user.id, req.params.productId);
  ApiResponse.success(res, 200, result.message);
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await userService.removeFromWishlist(req.user.id, req.params.productId);
  ApiResponse.success(res, 200, result.message);
});
