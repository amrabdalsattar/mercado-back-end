const userRepo = require('../user/user.repository');
const sellerService = require('../seller/seller.service');
const orderRepo = require('../order/order.repository');
const productRepo = require('../product/product.repository');
const bannerService = require('../banner/banner.service');
const promoService = require('../promo/promo.service');
const AppError = require('../../utils/AppError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const paginate = require('../../utils/paginate');
const User = require('../user/user.model');
const Order = require('../order/order.model');

// ─── Users ────────────────────────────────────────────────────────────────────

exports.listUsers = asyncHandler(async (req, res) => {
  const { docs, meta } = await paginate(User, req.query, {}, '-password -refreshToken');
  ApiResponse.success(res, 200, 'Users fetched', docs, meta);
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userRepo.updateById(req.params.id, { isActive });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  ApiResponse.success(res, 200, 'User status updated', user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await userRepo.softDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  ApiResponse.success(res, 200, 'User deleted');
});

// ─── Sellers ──────────────────────────────────────────────────────────────────

exports.listSellers = asyncHandler(async (req, res) => {
  const sellers = await sellerService.getAllSellers();
  ApiResponse.success(res, 200, 'Sellers fetched', sellers);
});

exports.approveSeller = asyncHandler(async (req, res) => {
  const seller = await sellerService.approveSeller(req.params.id);
  ApiResponse.success(res, 200, 'Seller approved', seller);
});

// ─── Orders ───────────────────────────────────────────────────────────────────

exports.listOrders = asyncHandler(async (req, res) => {
  const { docs, meta } = await paginate(Order, req.query, {}, null, [
    { path: 'user', select: 'name email' },
  ]);
  ApiResponse.success(res, 200, 'Orders fetched', docs, meta);
});

// ─── Banners ──────────────────────────────────────────────────────────────────

exports.listBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.getAll(true);
  ApiResponse.success(res, 200, 'Banners fetched', banners);
});

// ─── Analytics ────────────────────────────────────────────────────────────────

exports.getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    revenueAll,
    revenueToday,
    revenueMonth,
    topProducts,
    pendingOrders,
    deliveredOrders,
  ] = await Promise.all([
    userRepo.count(),
    userRepo.count({ createdAt: { $gte: todayStart } }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    orderRepo.totalRevenue(),
    orderRepo.totalRevenue({ createdAt: { $gte: todayStart } }),
    orderRepo.totalRevenue({ createdAt: { $gte: monthStart } }),
    orderRepo.topSellingProducts(5),
    orderRepo.countByStatus('pending'),
    orderRepo.countByStatus('delivered'),
  ]);

  ApiResponse.success(res, 200, 'Analytics fetched', {
    users: { total: totalUsers, newToday: newUsersToday },
    orders: {
      total: totalOrders,
      today: ordersToday,
      pending: pendingOrders,
      delivered: deliveredOrders,
    },
    revenue: {
      total: revenueAll[0]?.total || 0,
      today: revenueToday[0]?.total || 0,
      thisMonth: revenueMonth[0]?.total || 0,
    },
    topSellingProducts: topProducts,
  });
});
