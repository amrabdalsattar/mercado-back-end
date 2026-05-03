const sellerRepo = require('./seller.repository');
const userRepo = require('../user/user.repository');
const productRepo = require('../product/product.repository');
const orderRepo = require('../order/order.repository');
const AppError = require('../../utils/AppError');
const notificationService = require('../notification/notification.service');

class SellerService {
  async register(userId, data) {
    const existing = await sellerRepo.findByUser(userId);
    if (existing) throw new AppError('You already have a seller profile', 409, 'SELLER_EXISTS');

    const seller = await sellerRepo.create({
      user: userId,
      brandName: data.brandName,
      bio: data.bio,
      bankDetails: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
      },
    });

    return seller;
  }

  async getProfile(userId) {
    const seller = await sellerRepo.findByUser(userId);
    if (!seller) throw new AppError('Seller profile not found', 404, 'SELLER_NOT_FOUND');
    return seller;
  }

  async updateProfile(userId, data) {
    const seller = await sellerRepo.updateByUser(userId, data);
    if (!seller) throw new AppError('Seller profile not found', 404, 'SELLER_NOT_FOUND');
    return seller;
  }

  async getSellerProducts(userId) {
    return productRepo.findAll({ seller: userId });
  }

  async getSellerOrders(userId) {
    return orderRepo.findBySellerItems(userId);
  }

  async getEarnings(userId) {
    const seller = await sellerRepo.findByUser(userId);
    if (!seller) throw new AppError('Seller profile not found', 404, 'SELLER_NOT_FOUND');
    return {
      totalEarnings: seller.totalEarnings,
      pendingPayout: seller.pendingPayout,
      payoutRequests: seller.payoutRequests,
    };
  }

  async requestPayout(userId, amount) {
    const seller = await sellerRepo.findByUser(userId);
    if (!seller) throw new AppError('Seller profile not found', 404, 'SELLER_NOT_FOUND');
    if (!seller.isApproved) throw new AppError('Your seller account is pending approval', 403, 'NOT_APPROVED');
    if (seller.pendingPayout < amount) throw new AppError('Insufficient pending payout balance', 400, 'INSUFFICIENT_BALANCE');

    return sellerRepo.addPayout(userId, amount);
  }

  async getLowStockAlerts(userId, threshold = 10) {
    return productRepo.findLowStock(userId, threshold);
  }

  // Admin: approve seller
  async approveSeller(sellerId) {
    const seller = await sellerRepo.updateById(sellerId, { isApproved: true });
    if (!seller) throw new AppError('Seller not found', 404, 'SELLER_NOT_FOUND');

    const user = await userRepo.findById(seller.user);
    // Upgrade user role to seller
    await userRepo.updateById(seller.user, { role: 'seller' });
    notificationService.sendSellerApprovedEmail(user).catch(() => {});

    return seller;
  }

  async getAllSellers() {
    return sellerRepo.findAll();
  }
}

module.exports = new SellerService();
