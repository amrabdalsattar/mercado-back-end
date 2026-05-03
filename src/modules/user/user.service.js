const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepo = require('./user.repository');
const AppError = require('../../utils/AppError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/token');
const { sendEmail } = require('../../utils/email');
const notificationService = require('../notification/notification.service');
const cartService = require('../cart/cart.service');
const env = require('../../config/env');

class UserService {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  async register({ name, email, password, phone }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN');

    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await userRepo.create({
      name,
      email,
      phone,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send welcome + verification email (non-blocking)
    notificationService.sendWelcomeEmail(user, verificationToken).catch(() => {});

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async verifyEmail(token) {
    const user = await userRepo.findByVerificationToken(token);
    if (!user) throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');

    await userRepo.updateById(user._id, {
      isVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async login({ email, password }, sessionId) {
    const user = await userRepo.findByEmailWithPassword(email);
    if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    if (!user.isActive) throw new AppError('Your account has been suspended', 403, 'ACCOUNT_SUSPENDED');
    if (!user.isVerified) throw new AppError('Please verify your email before logging in', 403, 'EMAIL_NOT_VERIFIED');

    // Account lockout
    if (user.isLocked()) {
      throw new AppError('Account temporarily locked due to too many failed attempts', 423, 'ACCOUNT_LOCKED');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { loginAttempts: attempts };
      if (attempts >= 5) update.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      await userRepo.updateById(user._id, update);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on success
    await userRepo.updateById(user._id, { loginAttempts: 0, lockUntil: undefined });

    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await userRepo.updateById(user._id, { refreshToken });

    if (sessionId) {
      await cartService.mergeCart(user._id, sessionId).catch((err) => {
        console.error('Failed to merge cart on login:', err);
      });
    }

    return { accessToken, refreshToken, user: this._sanitize(user) };
  }

  async refresh(refreshTokenCookie) {
    if (!refreshTokenCookie) throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');

    const decoded = verifyRefreshToken(refreshTokenCookie);
    const user = await userRepo.findByRefreshToken(refreshTokenCookie);
    if (!user) throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');

    // Token rotation — invalidate old, issue new pair
    const payload = { id: user._id, role: user.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    await userRepo.updateById(user._id, { refreshToken: newRefreshToken });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    await userRepo.updateById(userId, { refreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepo.updateById(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    notificationService.sendPasswordResetEmail(user, resetToken).catch(() => {});

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword({ token, newPassword }) {
    const user = await userRepo.findByPasswordResetToken(token);
    if (!user) throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');

    const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await userRepo.updateById(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      refreshToken: undefined, // force re-login
    });

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  async updateProfile(userId, data) {
    const user = await userRepo.updateById(userId, data);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  async updateAvatar(userId, avatarUrl) {
    return this.updateProfile(userId, { avatar: avatarUrl });
  }

  // ─── Wishlist ──────────────────────────────────────────────────────────────

  async addToWishlist(userId, productId) {
    await userRepo.addToWishlist(userId, productId);
    return { message: 'Product added to wishlist' };
  }

  async removeFromWishlist(userId, productId) {
    await userRepo.removeFromWishlist(userId, productId);
    return { message: 'Product removed from wishlist' };
  }

  async getWishlist(userId) {
    const user = await userRepo.getWishlist(userId);
    return user?.wishlist || [];
  }

  // ─── Wallet ────────────────────────────────────────────────────────────────

  async topUpWallet(userId, amount) {
    if (amount <= 0) throw new AppError('Amount must be positive', 400, 'INVALID_AMOUNT');
    return userRepo.topUpWallet(userId, amount);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _sanitize(user) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    delete obj.refreshToken;
    delete obj.emailVerificationToken;
    delete obj.passwordResetToken;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
  }
}

module.exports = new UserService();
