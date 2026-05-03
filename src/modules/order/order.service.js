const orderRepo = require('./order.repository');
const cartRepo = require('../cart/cart.repository');
const productRepo = require('../product/product.repository');
const promoRepo = require('../promo/promo.repository');
const userRepo = require('../user/user.repository');
const sellerRepo = require('../seller/seller.repository');
const AppError = require('../../utils/AppError');
const notificationService = require('../notification/notification.service');

class OrderService {
  async placeOrder(userId, { shippingAddress, paymentMethod, promoCode, notes }, sessionId) {
    // Get cart
    const cart = await cartRepo.findByUser(userId, sessionId);
    if (!cart || !cart.items.length) throw new AppError('Cart is empty', 400, 'EMPTY_CART');

    // Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await productRepo.findById(item.product._id || item.product);
      if (!product || !product.isActive) {
        throw new AppError(`Product "${item.product.title || item.product}" is no longer available`, 400, 'PRODUCT_UNAVAILABLE');
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.title}"`, 400, 'INSUFFICIENT_STOCK');
      }

      const price = product.salePrice || product.price;
      orderItems.push({
        product: product._id,
        seller: product.seller,
        title: product.title,
        image: product.images?.[0] || null,
        price,
        quantity: item.quantity,
      });
      subtotal += price * item.quantity;
    }

    // Apply promo
    let discount = 0;
    let appliedPromoCode = null;
    if (promoCode) {
      const promo = await promoRepo.findByCode(promoCode);
      if (promo && promo.isActive && promo.expiresAt > new Date() && promo.usageCount < promo.usageLimit) {
        discount = promo.type === 'percentage' ? (subtotal * promo.value) / 100 : promo.value;
        discount = Math.min(discount, subtotal);
        appliedPromoCode = promo.code;
        await promoRepo.incrementUsage(promo._id);
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);

    // Handle payment
    if (paymentMethod === 'wallet') {
      const user = await userRepo.findById(userId);
      if (user.wallet < totalAmount) {
        throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_WALLET');
      }
      await userRepo.deductWallet(userId, totalAmount);
    }

    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

    // Create order
    const order = await orderRepo.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      totalAmount,
      discount,
      promoCode: appliedPromoCode,
      notes,
      timeline: [{ status: 'pending', note: 'Order placed successfully' }],
    });

    // Decrement stock
    for (const item of orderItems) {
      await productRepo.decrementStock(item.product, item.quantity);
    }

    // Clear cart
    await cartRepo.clearCart(cart._id);

    // Credit sellers if paid
    if (paymentStatus === 'paid') {
      await this._creditSellers(order);
    }

    // Send confirmation email
    const user = await userRepo.findById(userId);
    notificationService.sendOrderConfirmation(user, order).catch(() => {});

    return order;
  }

  async getById(orderId, user) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    if (user.role === 'customer' && order.user._id.toString() !== user.id) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
    return order;
  }

  async getUserOrders(userId) {
    return orderRepo.findByUser(userId);
  }

  async updateStatus(orderId, { status, trackingNumber, note }, user) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    // Sellers can update fulfillment only on their items
    if (user.role === 'seller') {
      const sellerItems = order.items.filter((i) => i.seller?.toString() === user.id);
      if (!sellerItems.length) throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    const updateData = { orderStatus: status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    await orderRepo.updateById(orderId, updateData);
    await orderRepo.addTimeline(orderId, { status, note: note || `Status updated to ${status}` });

    // Handle cancellation refund
    if (status === 'cancelled' || status === 'refunded') {
      for (const item of order.items) {
        await productRepo.incrementStock(item.product, item.quantity);
      }
      if (order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
        await userRepo.topUpWallet(order.user._id, order.totalAmount);
      }
      await orderRepo.updateById(orderId, { paymentStatus: status === 'refunded' ? 'refunded' : 'pending' });
    }

    if (status === 'delivered') {
      // If it was COD, it's now paid
      if (order.paymentStatus !== 'paid') {
        await orderRepo.updateById(orderId, { paymentStatus: 'paid' });
        await this._creditSellers(order);
      }
    }

    const updatedOrder = await orderRepo.findById(orderId);
    const orderUser = await userRepo.findById(order.user._id);
    notificationService.sendOrderStatusUpdate(orderUser, updatedOrder, status).catch(() => {});

    return updatedOrder;
  }

  async cancelOrder(orderId, userId) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    if (order.user._id.toString() !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      throw new AppError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL');
    }
    return this.updateStatus(orderId, { status: 'cancelled', note: 'Cancelled by customer' }, { role: 'admin', id: userId });
  }

  async _creditSellers(order) {
    const PLATFORM_FEE_PERCENT = 10; // 10% platform fee
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountFactor = subtotal > 0 ? (subtotal - (order.discount || 0)) / subtotal : 1;

    for (const item of order.items) {
      if (!item.seller) continue;

      const grossItemRevenue = item.price * item.quantity * discountFactor;
      const platformFee = (grossItemRevenue * PLATFORM_FEE_PERCENT) / 100;
      const netEarnings = grossItemRevenue - platformFee;

      await sellerRepo.incrementEarnings(item.seller, netEarnings).catch((err) => {
        console.error(`Failed to credit seller ${item.seller} for order ${order._id}:`, err);
      });
    }
  }
}

module.exports = new OrderService();
