const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    brandName: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    bio: { type: String },
    bankDetails: {
      bankName: { type: String, select: false },
      accountNumber: { type: String, select: false },
      routingNumber: { type: String, select: false },
    },
    isApproved: { type: Boolean, default: false },
    totalEarnings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    payoutRequests: [
      {
        amount: Number,
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now },
        paidAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
