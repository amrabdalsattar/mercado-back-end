const productRepo = require('./product.repository');
const categoryRepo = require('../category/category.repository');
const AppError = require('../../utils/AppError');
const paginate = require('../../utils/paginate');
const Product = require('./product.model');

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .concat('-', Date.now());

class ProductService {
  async getAll(queryParams) {
    const filter = { isActive: true };

    if (queryParams.search) {
      filter.$text = { $search: queryParams.search };
    }
    if (queryParams.category) {
      const cat = await categoryRepo.findBySlug(queryParams.category);
      if (cat) filter.category = cat._id;
    }
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) filter.price.$gte = Number(queryParams.minPrice);
      if (queryParams.maxPrice) filter.price.$lte = Number(queryParams.maxPrice);
    }
    if (queryParams.rating) {
      filter.ratings = { $gte: Number(queryParams.rating) };
    }
    if (queryParams.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }
    if (queryParams.seller) {
      filter.seller = queryParams.seller;
    }

    const { docs, meta } = await paginate(
      Product,
      queryParams,
      filter,
      null,
      [
        { path: 'category', select: 'name slug' },
        { path: 'seller', select: 'name' },
      ]
    );

    return { products: docs, meta };
  }

  async getById(id) {
    const product = await productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  async create(data, sellerId) {
    data.seller = sellerId;
    if (!data.slug) data.slug = slugify(data.title);

    return productRepo.create(data);
  }

  async update(id, data, user) {
    const product = await productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    // Sellers can only edit their own products
    if (user.role === 'seller' && product.seller._id.toString() !== user.id) {
      throw new AppError('You can only edit your own products', 403, 'FORBIDDEN');
    }

    if (data.title && !data.slug) data.slug = slugify(data.title);

    return productRepo.updateById(id, data);
  }

  async delete(id, user) {
    const product = await productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    if (user.role === 'seller' && product.seller._id.toString() !== user.id) {
      throw new AppError('You can only delete your own products', 403, 'FORBIDDEN');
    }

    await productRepo.softDelete(id);
    return { message: 'Product deleted successfully' };
  }

  async addImages(id, user, imageUrls) {
    const product = await productRepo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    if (user.role === 'seller' && product.seller._id.toString() !== user.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (product.images.length + imageUrls.length > 8) {
      throw new AppError('Maximum 8 images per product', 400, 'TOO_MANY_IMAGES');
    }

    return productRepo.updateById(id, { $push: { images: { $each: imageUrls } } });
  }

  async getFeatured() {
    const { docs } = await paginate(Product, { limit: 12 }, { isFeatured: true, isActive: true });
    return docs;
  }
}

module.exports = new ProductService();
