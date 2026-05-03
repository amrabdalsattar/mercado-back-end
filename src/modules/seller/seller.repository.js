const Seller = require('./seller.model');

class SellerRepository {
  findAll() { return Seller.find().populate('user', 'name email'); }
  findById(id) { return Seller.findById(id).populate('user', 'name email avatar'); }
  findByUser(userId) { return Seller.findOne({ user: userId }).populate('user', 'name email avatar'); }
  create(data) { return Seller.create(data); }
  updateByUser(userId, data) { return Seller.findOneAndUpdate({ user: userId }, data, { new: true }); }
  updateById(id, data) { return Seller.findByIdAndUpdate(id, data, { new: true }); }
  addPayout(userId, amount) {
    return Seller.findOneAndUpdate(
      { user: userId },
      { $push: { payoutRequests: { amount } }, $inc: { pendingPayout: amount } },
      { new: true }
    );
  }
  markPayoutPaid(sellerId, payoutId) {
    return Seller.findByIdAndUpdate(
      sellerId,
      {
        $set: { 'payoutRequests.$[req].status': 'paid', 'payoutRequests.$[req].paidAt': new Date() },
        $inc: { pendingPayout: 0 },
      },
      { arrayFilters: [{ 'req._id': payoutId }], new: true }
    );
  }

  incrementEarnings(sellerId, amount) {
    return Seller.findOneAndUpdate(
      { user: sellerId },
      { $inc: { totalEarnings: amount, pendingPayout: amount } },
      { new: true }
    );
  }
}

module.exports = new SellerRepository();
