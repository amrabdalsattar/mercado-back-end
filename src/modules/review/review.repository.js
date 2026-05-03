const Review = require('./review.model');

class ReviewRepository {
  findByProduct(productId) {
    return Review.find({ product: productId }).populate('user', 'name avatar');
  }

  findById(id) {
    return Review.findById(id);
  }

  findByUserAndProduct(userId, productId) {
    return Review.findOne({ user: userId, product: productId });
  }

  create(data) {
    return Review.create(data);
  }

  updateById(id, data) {
    return Review.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id) {
    return Review.findByIdAndDelete(id);
  }

  getAverageRating(productId) {
    return Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
  }

  findByUser(userId) {
    return Review.find({ user: userId }).populate('product', 'title images');
  }
}

module.exports = new ReviewRepository();
