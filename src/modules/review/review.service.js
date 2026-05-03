const reviewRepo = require('./review.repository');
const productRepo = require('../product/product.repository');
const orderRepo = require('../order/order.repository');
const AppError = require('../../utils/AppError');
const mongoose = require('mongoose');

class ReviewService {
  async getProductReviews(productId) {
    return reviewRepo.findByProduct(productId);
  }

  async getUserReviews(userId) {
    return reviewRepo.findByUser(userId);
  }

  async create(productId, userId, data) {
    const product = await productRepo.findById(productId);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    const existing = await reviewRepo.findByUserAndProduct(userId, productId);
    if (existing) throw new AppError('You have already reviewed this product', 409, 'ALREADY_REVIEWED');

    // Check if user has purchased the product
    const hasPurchased = await orderRepo.hasUserPurchasedProduct(userId, productId);

    const review = await reviewRepo.create({
      product: productId,
      user: userId,
      rating: data.rating,
      comment: data.comment,
      isVerifiedPurchase: hasPurchased,
    });

    await this._updateProductRating(productId);
    return review;
  }

  async update(reviewId, userId, data) {
    const review = await reviewRepo.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    if (review.user.toString() !== userId) throw new AppError('Not authorized', 403, 'FORBIDDEN');

    const updated = await reviewRepo.updateById(reviewId, data);
    await this._updateProductRating(review.product);
    return updated;
  }

  async delete(reviewId, user) {
    const review = await reviewRepo.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');

    if (user.role !== 'admin' && review.user.toString() !== user.id) {
      throw new AppError('Not authorized', 403, 'FORBIDDEN');
    }

    const productId = review.product;
    await reviewRepo.deleteById(reviewId);
    await this._updateProductRating(productId);
    return { message: 'Review deleted' };
  }

  async _updateProductRating(productId) {
    const result = await reviewRepo.getAverageRating(new mongoose.Types.ObjectId(productId));
    if (result.length > 0) {
      const { avgRating, count } = result[0];
      await productRepo.updateRating(productId, Math.round(avgRating * 10) / 10, count);
    } else {
      await productRepo.updateRating(productId, 0, 0);
    }
  }
}

module.exports = new ReviewService();
