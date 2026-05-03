const cartRepo = require('./cart.repository');
const productRepo = require('../product/product.repository');
const promoService = require('../promo/promo.service');
const AppError = require('../../utils/AppError');

class CartService {
  async getCart(userId, sessionId) {
    let cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) return { items: [], subtotal: 0, discount: 0, total: 0 };
    return this._buildSummary(cart);
  }

  async addItem(userId, sessionId, { productId, quantity }) {
    const product = await productRepo.findById(productId);
    if (!product || !product.isActive) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    if (product.stock < quantity) throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');

    let cart = await cartRepo.findByUser(userId, sessionId);
    const price = product.salePrice || product.price;

    if (!cart) {
      cart = await cartRepo.create({
        user: userId || null,
        sessionId: !userId ? sessionId : null,
        items: [{ product: productId, quantity, price }],
      });
    } else {
      const existingIndex = cart.items.findIndex((i) => i.product._id.toString() === productId);
      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (product.stock < newQty) throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity, price });
      }
      await cart.save();
    }

    return cartRepo.findByUser(userId, sessionId);
  }

  async updateItem(userId, sessionId, productId, quantity) {
    const product = await productRepo.findById(productId);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    if (product.stock < quantity) throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');

    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');

    const item = cart.items.find((i) => i.product._id.toString() === productId);
    if (!item) throw new AppError('Item not in cart', 404, 'ITEM_NOT_FOUND');

    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId, sessionId, productId) {
    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');

    cart.items = cart.items.filter((i) => i.product._id.toString() !== productId);
    await cart.save();
    return cart;
  }

  async applyCoupon(userId, sessionId, code) {
    const promo = await promoService.validate(code);
    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');

    await cartRepo.updateById(cart._id, { coupon: promo.code });
    return { message: 'Coupon applied', promo };
  }

  async removeCoupon(userId, sessionId) {
    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    await cartRepo.updateById(cart._id, { coupon: null });
    return { message: 'Coupon removed' };
  }

  async getCartSummary(userId, sessionId) {
    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart) return { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };

    const summary = await this._buildSummary(cart);
    summary.shipping = summary.subtotal > 100 ? 0 : 9.99;
    summary.tax = +(summary.subtotal * 0.08).toFixed(2);
    summary.total = +(summary.subtotal - summary.discount + summary.shipping + summary.tax).toFixed(2);
    return summary;
  }

  async mergeCart(userId, sessionId) {
    if (!sessionId) return;

    const guestCart = await cartRepo.findByUser(null, sessionId);
    if (!guestCart || !guestCart.items.length) return;

    let userCart = await cartRepo.findByUser(userId, null);

    if (!userCart) {
      // Just transfer ownership
      await cartRepo.updateById(guestCart._id, { user: userId, sessionId: null });
    } else {
      // Merge items
      for (const gItem of guestCart.items) {
        const existingIndex = userCart.items.findIndex(
          (uItem) => uItem.product._id.toString() === gItem.product._id.toString()
        );

        if (existingIndex > -1) {
          userCart.items[existingIndex].quantity += gItem.quantity;
        } else {
          userCart.items.push({
            product: gItem.product._id,
            quantity: gItem.quantity,
            price: gItem.price,
          });
        }
      }
      await userCart.save();
      await cartRepo.clearCart(guestCart._id); // Clear and delete? Or just delete?
      // Repository clearCart just clears items. Let's delete the guest cart document.
      await guestCart.deleteOne();
    }
  }

  async _buildSummary(cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { cart, subtotal: +subtotal.toFixed(2), discount: 0, total: +subtotal.toFixed(2) };
  }
}

module.exports = new CartService();
