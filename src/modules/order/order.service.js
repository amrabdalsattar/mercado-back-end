const orderRepo = require('./order.repository');
const cartRepo = require('../cart/cart.repository');
const productRepo = require('../product/product.repository');
const promoRepo = require('../promo/promo.repository');
const userRepo = require('../user/user.repository');
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
      await orderRepo.updateById(orderId, { paymentStatus: 'paid' });
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
}

module.exports = new OrderService();
