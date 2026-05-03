require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const logger = require('../utils/logger');

const User = require('../modules/user/user.model');
const Category = require('../modules/category/category.model');
const Product = require('../modules/product/product.model');
const Promo = require('../modules/promo/promo.model');
const Seller = require('../modules/seller/seller.model');
const Banner = require('../modules/banner/banner.model');
const Order = require('../modules/order/order.model');

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);
  logger.info('Connected to MongoDB for seeding...');

  // Clear all collections
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Promo.deleteMany(),
    Seller.deleteMany(),
    Banner.deleteMany(),
    Order.deleteMany(),
  ]);
  logger.info('✅ Collections cleared');

  const salt = env.BCRYPT_SALT_ROUNDS;

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const sellerPassword = await bcrypt.hash('Seller123!', salt);
  const customerPassword = await bcrypt.hash('Customer123!', salt);

  const [admin, seller1, seller2, seller3, ...customers] = await User.create([
    {
      name: 'Super Admin',
      email: 'admin@mercado.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      wallet: 10000,
    },
    {
      name: 'Alice Vendor',
      email: 'alice@mercado.com',
      password: sellerPassword,
      role: 'seller',
      isVerified: true,
      wallet: 500,
    },
    {
      name: 'Bob Store',
      email: 'bob@mercado.com',
      password: sellerPassword,
      role: 'seller',
      isVerified: true,
      wallet: 750,
    },
    {
      name: 'Carol Shop',
      email: 'carol@mercado.com',
      password: sellerPassword,
      role: 'seller',
      isVerified: true,
      wallet: 300,
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@mercado.com`,
      password: customerPassword,
      role: 'customer',
      isVerified: true,
      wallet: 200 + i * 50,
    })),
  ]);
  logger.info('✅ Users created');

  // ── Seller Profiles ────────────────────────────────────────────────────────
  await Seller.create([
    { user: seller1._id, brandName: "Alice's Tech Hub", bio: 'Premium electronics and gadgets', isApproved: true, totalEarnings: 5000 },
    { user: seller2._id, brandName: "Bob's Fashion World", bio: 'Trendy clothing for all', isApproved: true, totalEarnings: 3200 },
    { user: seller3._id, brandName: "Carol's Home Goods", bio: 'Quality home essentials', isApproved: true, totalEarnings: 2100 },
  ]);
  logger.info('✅ Seller profiles created');

  // ── Categories ─────────────────────────────────────────────────────────────
  const [electronics, fashion, home, sports, books, beauty, food, toys] = await Category.create([
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets & devices' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes & accessories' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home essentials' },
    { name: 'Sports', slug: 'sports', description: 'Sports & outdoor equipment' },
    { name: 'Books', slug: 'books', description: 'All genres of books' },
    { name: 'Beauty', slug: 'beauty', description: 'Beauty & personal care' },
    { name: 'Food & Grocery', slug: 'food-grocery', description: 'Fresh and packaged foods' },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Fun for all ages' },
  ]);

  // Subcategories
  await Category.create([
    { name: 'Smartphones', slug: 'smartphones', parent: electronics._id },
    { name: 'Laptops', slug: 'laptops', parent: electronics._id },
    { name: 'Audio', slug: 'audio', parent: electronics._id },
    { name: "Men's Clothing", slug: 'mens-clothing', parent: fashion._id },
    { name: "Women's Clothing", slug: 'womens-clothing', parent: fashion._id },
    { name: 'Shoes', slug: 'shoes', parent: fashion._id },
    { name: 'Furniture', slug: 'furniture', parent: home._id },
    { name: 'Kitchen', slug: 'kitchen', parent: home._id },
    { name: 'Fitness', slug: 'fitness', parent: sports._id },
    { name: 'Outdoor', slug: 'outdoor', parent: sports._id },
    { name: 'Fiction', slug: 'fiction', parent: books._id },
    { name: 'Self Help', slug: 'self-help', parent: books._id },
    { name: 'Skincare', slug: 'skincare', parent: beauty._id },
    { name: 'Makeup', slug: 'makeup', parent: beauty._id },
    { name: 'Snacks', slug: 'snacks', parent: food._id },
    { name: 'Beverages', slug: 'beverages', parent: food._id },
    { name: 'Action Figures', slug: 'action-figures', parent: toys._id },
    { name: 'Board Games', slug: 'board-games', parent: toys._id },
    { name: 'Networking', slug: 'networking', parent: electronics._id },
    { name: 'Cameras', slug: 'cameras', parent: electronics._id },
    { name: 'Running', slug: 'running', parent: sports._id },
    { name: 'Swimming', slug: 'swimming', parent: sports._id },
    { name: 'Cookbooks', slug: 'cookbooks', parent: books._id },
    { name: 'Haircare', slug: 'haircare', parent: beauty._id },
  ]);
  logger.info('✅ Categories (8 top-level + 24 sub) created');

  // ── Products ───────────────────────────────────────────────────────────────
  const productSeeds = [
    // Electronics (seller1)
    { title: 'iPhone 15 Pro Max', price: 1199, salePrice: 1099, stock: 50, category: electronics._id, seller: seller1._id, isFeatured: true, ratings: 4.8, reviewCount: 120, description: 'Latest Apple flagship smartphone with titanium design, A17 Pro chip, and 48MP camera system.', images: ['https://picsum.photos/seed/iphone/400/400'], tags: ['apple', 'smartphone'] },
    { title: 'MacBook Pro M3 14"', price: 1999, stock: 30, category: electronics._id, seller: seller1._id, isFeatured: true, ratings: 4.9, reviewCount: 85, description: 'Incredible performance with M3 chip. Up to 22 hours battery life.', images: ['https://picsum.photos/seed/macbook/400/400'], tags: ['apple', 'laptop'] },
    { title: 'Sony WH-1000XM5 Headphones', price: 399, salePrice: 299, stock: 80, category: electronics._id, seller: seller1._id, ratings: 4.7, reviewCount: 200, description: 'Industry-leading noise cancellation headphones with 30h battery.', images: ['https://picsum.photos/seed/headphones/400/400'], tags: ['sony', 'audio'] },
    { title: 'Samsung 4K Smart TV 55"', price: 799, salePrice: 649, stock: 20, category: electronics._id, seller: seller1._id, isFeatured: true, ratings: 4.5, reviewCount: 310, description: 'Crystal 4K display, Tizen OS, built-in streaming apps.', images: ['https://picsum.photos/seed/tv/400/400'], tags: ['samsung', 'tv'] },
    { title: 'iPad Air M1', price: 749, stock: 40, category: electronics._id, seller: seller1._id, ratings: 4.6, reviewCount: 95, description: 'Powerful M1 chip in a thin and light design. Perfect for creativity.', images: ['https://picsum.photos/seed/ipad/400/400'], tags: ['apple', 'tablet'] },
    // Fashion (seller2)
    { title: 'Classic Levi\'s 501 Jeans', price: 89, salePrice: 69, stock: 150, category: fashion._id, seller: seller2._id, isFeatured: true, ratings: 4.5, reviewCount: 450, description: 'The original straight-fit jeans. Timeless American style.', images: ['https://picsum.photos/seed/jeans/400/400'], tags: ['levis', 'denim'] },
    { title: 'Nike Air Max 270', price: 150, salePrice: 119, stock: 100, category: fashion._id, seller: seller2._id, ratings: 4.7, reviewCount: 380, description: 'Maximum comfort with the largest Air unit ever. Iconic silhouette.', images: ['https://picsum.photos/seed/nike/400/400'], tags: ['nike', 'shoes'] },
    { title: 'Adidas Ultraboost 23', price: 180, stock: 70, category: fashion._id, seller: seller2._id, ratings: 4.6, reviewCount: 220, description: 'Responsive Boost cushioning for all-day energy return.', images: ['https://picsum.photos/seed/adidas/400/400'], tags: ['adidas', 'running'] },
    { title: 'Ralph Lauren Polo Shirt', price: 95, stock: 200, category: fashion._id, seller: seller2._id, ratings: 4.4, reviewCount: 180, description: 'Classic fit polo in 100% cotton mesh. Iconic embroidered pony logo.', images: ['https://picsum.photos/seed/polo/400/400'], tags: ['polo', 'shirt'] },
    { title: 'Zara Floral Midi Dress', price: 65, salePrice: 45, stock: 80, category: fashion._id, seller: seller2._id, ratings: 4.3, reviewCount: 130, description: 'Elegant floral print midi dress perfect for summer occasions.', images: ['https://picsum.photos/seed/dress/400/400'], tags: ['zara', 'dress'] },
    // Home (seller3)
    { title: 'Dyson V15 Vacuum', price: 749, salePrice: 649, stock: 25, category: home._id, seller: seller3._id, isFeatured: true, ratings: 4.8, reviewCount: 290, description: 'Powerful cordless vacuum with laser dust detection technology.', images: ['https://picsum.photos/seed/dyson/400/400'], tags: ['dyson', 'vacuum'] },
    { title: 'KitchenAid Stand Mixer', price: 449, salePrice: 379, stock: 35, category: home._id, seller: seller3._id, ratings: 4.9, reviewCount: 520, description: 'The iconic stand mixer. 5-quart bowl, 10 speeds, 59 attachments.', images: ['https://picsum.photos/seed/mixer/400/400'], tags: ['kitchenaid', 'cooking'] },
    { title: 'IKEA MALM Bed Frame', price: 299, stock: 15, category: home._id, seller: seller3._id, ratings: 4.2, reviewCount: 340, description: 'Clean-lined bed frame in wood veneer. Queen size included.', images: ['https://picsum.photos/seed/bed/400/400'], tags: ['ikea', 'furniture'] },
    { title: 'Instant Pot Duo 7-in-1', price: 99, salePrice: 79, stock: 60, category: home._id, seller: seller3._id, ratings: 4.7, reviewCount: 1200, description: 'Pressure cooker, slow cooker, rice cooker, steamer and more in one.', images: ['https://picsum.photos/seed/instantpot/400/400'], tags: ['instantpot', 'cooking'] },
    { title: 'Roomba i7+ Robot Vacuum', price: 799, salePrice: 599, stock: 18, category: home._id, seller: seller3._id, isFeatured: true, ratings: 4.6, reviewCount: 410, description: 'Self-emptying robot vacuum. Learns your home layout.', images: ['https://picsum.photos/seed/roomba/400/400'], tags: ['irobot', 'vacuum'] },
    // More from mixed sellers
    { title: 'Atomic Habits (Book)', price: 18, stock: 500, category: books._id, seller: seller1._id, ratings: 4.9, reviewCount: 2800, description: 'Tiny changes, remarkable results. A guide to building good habits.', images: ['https://picsum.photos/seed/book1/400/400'], tags: ['habits', 'self-help'] },
    { title: 'Canon EOS R50 Camera', price: 679, salePrice: 599, stock: 22, category: electronics._id, seller: seller1._id, ratings: 4.7, reviewCount: 65, description: 'Compact mirrorless camera with 24.2MP, 4K video, and WiFi.', images: ['https://picsum.photos/seed/camera/400/400'], tags: ['canon', 'camera'] },
    { title: 'Yoga Mat Premium', price: 45, salePrice: 35, stock: 120, category: sports._id, seller: seller2._id, ratings: 4.5, reviewCount: 670, description: 'Non-slip 6mm thick yoga mat with alignment lines. Eco-friendly TPE.', images: ['https://picsum.photos/seed/yoga/400/400'], tags: ['yoga', 'fitness'] },
    { title: 'The Ordinary Serum Set', price: 35, stock: 300, category: beauty._id, seller: seller3._id, ratings: 4.6, reviewCount: 920, description: 'Bestselling skincare serum bundle: Niacinamide, Hyaluronic Acid & Vitamin C.', images: ['https://picsum.photos/seed/serum/400/400'], tags: ['skincare', 'beauty'] },
    { title: 'LEGO Star Wars Millennium Falcon', price: 849, salePrice: 749, stock: 12, category: toys._id, seller: seller2._id, isFeatured: true, ratings: 4.9, reviewCount: 380, description: '7541-piece ultimate collector set. Highly detailed iconic spaceship.', images: ['https://picsum.photos/seed/lego/400/400'], tags: ['lego', 'star-wars'] },
    // 40 more products covering all categories
    ...Array.from({ length: 40 }, (_, i) => ({
      title: `Product ${i + 21}`,
      price: +(Math.random() * 200 + 20).toFixed(2),
      stock: Math.floor(Math.random() * 100) + 10,
      category: [electronics, fashion, home, sports, books, beauty, food, toys][i % 8]._id,
      seller: [seller1, seller2, seller3][i % 3]._id,
      description: `High-quality product ${i + 21} with premium materials and excellent craftsmanship designed for everyday use.`,
      ratings: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200),
      images: [`https://picsum.photos/seed/product${i + 21}/400/400`],
    })),
  ];

  await Product.insertMany(productSeeds.map(p => ({ ...p, slug: `${p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })));
  logger.info('✅ 60 Products created');

  // ── Promo Codes ────────────────────────────────────────────────────────────
  await Promo.create([
    { code: 'WELCOME10', type: 'percentage', value: 10, usageLimit: 1000, expiresAt: new Date('2026-12-31'), description: '10% off your first order' },
    { code: 'SAVE20', type: 'fixed', value: 20, usageLimit: 500, expiresAt: new Date('2026-12-31'), minOrderAmount: 100, description: '$20 off orders over $100' },
    { code: 'FLASH50', type: 'percentage', value: 50, usageLimit: 100, expiresAt: new Date('2026-06-30'), description: 'Flash sale: 50% off!' },
    { code: 'VIP15', type: 'percentage', value: 15, usageLimit: 200, expiresAt: new Date('2026-12-31'), description: 'VIP members exclusive 15% off' },
    { code: 'FREESHIP', type: 'fixed', value: 9.99, usageLimit: 2000, expiresAt: new Date('2026-12-31'), description: 'Free shipping on any order' },
  ]);
  logger.info('✅ 5 Promo codes created');

  // ── Banners ────────────────────────────────────────────────────────────────
  await Banner.create([
    { title: 'Summer Sale — Up to 50% Off', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/products?sale=true', order: 1 },
    { title: 'New Arrivals — Shop Now', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/products?sort=-createdAt', order: 2 },
  ]);
  logger.info('✅ 2 Banners created');

  logger.info('🌱 Database seeded successfully!');
  logger.info('');
  logger.info('📋 Seed Credentials:');
  logger.info('  Admin:    admin@mercado.com / Admin123!');
  logger.info('  Seller1:  alice@mercado.com / Seller123!');
  logger.info('  Seller2:  bob@mercado.com   / Seller123!');
  logger.info('  Customer: customer1@mercado.com / Customer123!');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
