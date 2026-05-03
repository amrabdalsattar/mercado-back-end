const { sendEmail } = require('../../utils/email');
const env = require('../../config/env');

class NotificationService {
  _verifyUrl(token) {
    return `${env.CLIENT_URL}/verify-email?token=${token}`;
  }

  _resetUrl(token) {
    return `${env.CLIENT_URL}/reset-password?token=${token}`;
  }

  async sendWelcomeEmail(user, verificationToken) {
    const url = this._verifyUrl(verificationToken);
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Mercado — Verify Your Email',
      html: `
        <h2>Welcome, ${user.name}!</h2>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${url}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const url = this._resetUrl(resetToken);
    await sendEmail({
      to: user.email,
      subject: 'Mercado — Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click below to set a new password:</p>
        <a href="${url}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    });
  }

  async sendOrderConfirmation(user, order) {
    await sendEmail({
      to: user.email,
      subject: `Mercado — Order Confirmed #${order._id}`,
      html: `
        <h2>Order Confirmed!</h2>
        <p>Hi ${user.name}, your order <strong>#${order._id}</strong> has been placed successfully.</p>
        <p>Total: <strong>$${order.totalAmount.toFixed(2)}</strong></p>
        <p>Payment Method: ${order.paymentMethod}</p>
        <p>We'll notify you when it ships.</p>
      `,
    });
  }

  async sendOrderStatusUpdate(user, order, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed by the seller.',
      processing: 'Your order is being processed.',
      shipped: `Your order has been shipped! Tracking: ${order.trackingNumber || 'N/A'}`,
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'Your order has been cancelled.',
      refunded: 'Your refund has been processed.',
    };

    const msg = statusMessages[newStatus] || `Order status updated to: ${newStatus}`;

    await sendEmail({
      to: user.email,
      subject: `Mercado — Order Update #${order._id}`,
      html: `
        <h2>Order Update</h2>
        <p>Hi ${user.name},</p>
        <p>${msg}</p>
        <p>Order ID: <strong>#${order._id}</strong></p>
      `,
    });
  }

  async sendSellerApprovedEmail(user) {
    await sendEmail({
      to: user.email,
      subject: 'Mercado — Your Seller Account is Approved!',
      html: `
        <h2>Congratulations, ${user.name}!</h2>
        <p>Your seller account has been approved. You can now start listing products on Mercado.</p>
        <a href="${env.CLIENT_URL}/seller/dashboard" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Go to Seller Dashboard</a>
      `,
    });
  }

  async sendPayoutConfirmation(user, amount) {
    await sendEmail({
      to: user.email,
      subject: 'Mercado — Payout Processed',
      html: `
        <h2>Payout Confirmation</h2>
        <p>Hi ${user.name}, your payout of <strong>$${amount.toFixed(2)}</strong> has been processed.</p>
        <p>It will reflect in your bank account within 3–5 business days.</p>
      `,
    });
  }
}

module.exports = new NotificationService();
