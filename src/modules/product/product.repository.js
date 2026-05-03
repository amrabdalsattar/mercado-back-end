const Product = require('./product.model');

class ProductRepository {
  findAll(filter = {}) {
    return Product.find(filter).populate('category', 'name slug').populate('seller', 'name');
  }

  findById(id) {
    return Product.findById(id).populate('category', 'name slug').populate('seller', 'name avatar');
  }

  findBySlug(slug) {
    return Product.findOne({ slug }).populate('category', 'name slug').populate('seller', 'name avatar');
  }

  create(data) {
    return Product.create(data);
  }

  updateById(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  softDelete(id) {
    return Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }

  decrementStock(id, qty) {
    return Product.findByIdAndUpdate(id, { $inc: { stock: -qty } }, { new: true });
  }

  incrementStock(id, qty) {
    return Product.findByIdAndUpdate(id, { $inc: { stock: qty } }, { new: true });
  }

  updateRating(id, ratings, reviewCount) {
    return Product.findByIdAndUpdate(id, { ratings, reviewCount }, { new: true });
  }

  countBySeller(sellerId) {
    return Product.countDocuments({ seller: sellerId });
  }

  findLowStock(sellerId, threshold = 10) {
    return Product.find({ seller: sellerId, stock: { $lt: threshold }, isActive: true });
  }
}

module.exports = new ProductRepository();
