const Category = require('./category.model');

class CategoryRepository {
  findAll(filter = {}) {
    return Category.find(filter).populate('children');
  }

  findById(id) {
    return Category.findById(id).populate('children');
  }

  findBySlug(slug) {
    return Category.findOne({ slug }).populate('children');
  }

  create(data) {
    return Category.create(data);
  }

  updateById(id, data) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteById(id) {
    return Category.findByIdAndDelete(id);
  }

  findTopLevel() {
    return Category.find({ parent: null, isActive: true }).populate('children');
  }
}

module.exports = new CategoryRepository();
