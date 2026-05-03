const orderRepo = require('../order/order.repository');
const userRepo = require('../user/user.repository');
const AppError = require('../../utils/AppError');
const notificationService = require('../notification/notification.service');

class PaymentService {
  /**
   * Mock card payment — simulates card validation.
   */
  async cardPay(userId, { orderId, cardNumber, expiryMonth, expiryYear, cvv }) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.user._id.toString() !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');
    if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400, 'ALREADY_PAID');

    // Mock validation: fail if card starts with 0000
    if (cardNumber.startsWith('0000')) {
      await orderRepo.updateById(orderId, { paymentStatus: 'failed', orderStatus: 'failed' });
      throw new AppError('Card declined', 402, 'CARD_DECLINED');
    }

    await orderRepo.updateById(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });
    await orderRepo.addTimeline(orderId, { status: 'confirmed', note: 'Payment successful via card' });

    const user = await userRepo.findById(userId);
    notificationService.sendOrderStatusUpdate(user, order, 'confirmed').catch(() => {});

    return { message: 'Payment successful', orderId };
  }

  /**
   * Wallet payment — deducts from user's mock wallet.
   */
  async walletPay(userId, { orderId }) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.user._id.toString() !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');
    if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400, 'ALREADY_PAID');

    const user = await userRepo.findById(userId);
    if (user.wallet < order.totalAmount) throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_WALLET');

    await userRepo.deductWallet(userId, order.totalAmount);
    await orderRepo.updateById(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });
    await orderRepo.addTimeline(orderId, { status: 'confirmed', note: 'Payment successful via wallet' });

    notificationService.sendOrderStatusUpdate(user, order, 'confirmed').catch(() => {});

    return { message: 'Payment successful via wallet', orderId };
  }

  /**
   * Cash on Delivery — order placed without upfront payment.
   */
  async codOrder(userId, { orderId }) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.user._id.toString() !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');
    if (order.paymentMethod !== 'cod') throw new AppError('Order is not COD', 400, 'NOT_COD_ORDER');

    await orderRepo.updateById(orderId, { orderStatus: 'confirmed' });
    await orderRepo.addTimeline(orderId, { status: 'confirmed', note: 'COD order confirmed' });

    return { message: 'COD order confirmed', orderId };
  }
}

module.exports = new PaymentService();
