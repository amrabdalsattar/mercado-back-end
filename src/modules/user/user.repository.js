const User = require('./user.model');

class UserRepository {
  findById(id, select = '') {
    return User.findById(id).select(select);
  }

  findByEmail(email, select = '') {
    return User.findOne({ email }).select(select);
  }

  findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password +refreshToken +loginAttempts +lockUntil');
  }

  findByRefreshToken(token) {
    return User.findOne({ refreshToken: token }).select('+refreshToken');
  }

  findByVerificationToken(token) {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');
  }

  findByPasswordResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +password');
  }

  create(data) {
    return User.create(data);
  }

  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  updateByEmail(email, data) {
    return User.findOneAndUpdate({ email }, data, { new: true });
  }

  addToWishlist(userId, productId) {
    return User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { new: true });
  }

  removeFromWishlist(userId, productId) {
    return User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { new: true });
  }

  getWishlist(userId) {
    return User.findById(userId).populate('wishlist');
  }

  topUpWallet(userId, amount) {
    return User.findByIdAndUpdate(userId, { $inc: { wallet: amount } }, { new: true });
  }

  deductWallet(userId, amount) {
    return User.findByIdAndUpdate(userId, { $inc: { wallet: -amount } }, { new: true });
  }

  // Admin helpers
  findAll(filter = {}, select = '') {
    return User.find(filter).select(select);
  }

  softDelete(id) {
    return User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }

  count(filter = {}) {
    return User.countDocuments(filter);
  }
}

module.exports = new UserRepository();
