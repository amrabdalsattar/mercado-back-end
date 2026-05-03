const categoryRepo = require('./category.repository');
const AppError = require('../../utils/AppError');

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

class CategoryService {
  async getAll() {
    return categoryRepo.findTopLevel();
  }

  async getById(id) {
    const category = await categoryRepo.findById(id);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  async getBySlug(slug) {
    const category = await categoryRepo.findBySlug(slug);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  async create(data) {
    if (!data.slug) data.slug = slugify(data.name);
    const existing = await categoryRepo.findBySlug(data.slug);
    if (existing) throw new AppError('Category with this slug already exists', 409, 'SLUG_TAKEN');
    return categoryRepo.create(data);
  }

  async update(id, data) {
    if (data.name && !data.slug) data.slug = slugify(data.name);
    const category = await categoryRepo.updateById(id, data);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  async delete(id) {
    const category = await categoryRepo.deleteById(id);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return { message: 'Category deleted successfully' };
  }
}

module.exports = new CategoryService();
