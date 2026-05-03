const Order = require('./order.model');

class OrderRepository {
  findById(id) {
    return Order.findById(id).populate('items.product', 'title images price').populate('user', 'name email');
  }

  findByUser(userId) {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product', 'title images');
  }

  findAll(filter = {}) {
    return Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  }

  create(data) {
    return Order.create(data);
  }

  updateById(id, data) {
    return Order.findByIdAndUpdate(id, data, { new: true });
  }

  addTimeline(id, entry) {
    return Order.findByIdAndUpdate(id, { $push: { timeline: entry } }, { new: true });
  }

  countByStatus(status) {
    return Order.countDocuments({ orderStatus: status });
  }

  // Revenue aggregation
  totalRevenue(filter = {}) {
    return Order.aggregate([
      { $match: { paymentStatus: 'paid', ...filter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
  }

  topSellingProducts(limit = 5) {
    return Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Checks if a user has a delivered order containing a specific product.
   */
  async hasUserPurchasedProduct(userId, productId) {
    const mongoose = require('mongoose');
    const order = await Order.findOne({
      user: userId,
      orderStatus: 'delivered',
      'items.product': new mongoose.Types.ObjectId(productId),
    });
    return !!order;
  }

  findBySellerItems(sellerId) {
    return Order.find({ 'items.seller': sellerId }).populate('user', 'name email');
  }
}

module.exports = new OrderRepository();
