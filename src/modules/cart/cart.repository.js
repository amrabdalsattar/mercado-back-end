const Cart = require('./cart.model');

class CartRepository {
  findByUser(userId, sessionId) {
    if (userId) return Cart.findOne({ user: userId }).populate('items.product');
    return Cart.findOne({ sessionId }).populate('items.product');
  }

  findById(id) {
    return Cart.findById(id).populate('items.product');
  }

  create(data) {
    return Cart.create(data);
  }

  updateById(id, data) {
    return Cart.findByIdAndUpdate(id, data, { new: true }).populate('items.product');
  }

  clearCart(id) {
    return Cart.findByIdAndUpdate(id, { items: [], coupon: null });
  }

  mergeGuestCart(userId, sessionId) {
    // Move items from guest cart to user cart
    return Cart.findOneAndUpdate({ sessionId }, { user: userId, sessionId: null }, { new: true });
  }
}

module.exports = new CartRepository();
