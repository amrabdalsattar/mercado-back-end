const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    saleEndsAt: { type: Date, default: null },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true },
    tags: [{ type: String }],
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    currency: { type: String, default: 'USD' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

// Exclude soft-deleted products
productSchema.pre(/^find/, function () {
  if (!this.getOptions().withDeleted) {
    this.where({ deletedAt: null });
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
