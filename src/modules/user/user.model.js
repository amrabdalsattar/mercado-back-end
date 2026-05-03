const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    avatar: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [addressSchema],
    wallet: { type: Number, default: 0, min: 0 },
    refreshToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Exclude soft-deleted users from queries by default
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().withDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model('User', userSchema);
module.exports = User;
