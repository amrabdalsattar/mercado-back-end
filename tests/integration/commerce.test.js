const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/modules/auth/auth.model');
const Product = require('../../src/modules/catalog/product.model');
const Category = require('../../src/modules/catalog/category.model');
const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');

describe('Commerce Flow Integration', () => {
  let userToken;
  let userId;
  let sellerToken;
  let sellerId;
  let productId;
  let categoryId;
  let orderId;

  beforeAll(async () => {
    // 1. Create a user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'customer',
      isEmailVerified: true,
    });
    userId = user._id;
    userToken = jwt.sign({ userId: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // 2. Create a seller
    const seller = await User.create({
      firstName: 'Test',
      lastName: 'Seller',
      email: 'seller@test.com',
      password: 'Password123!',
      role: 'seller',
      isEmailVerified: true,
      sellerProfile: {
        storeName: 'Test Store',
        description: 'Store desc',
      },
      status: 'active',
    });
    sellerId = seller._id;
    sellerToken = jwt.sign({ userId: seller._id, role: seller.role }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // 3. Create a category
    const category = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Tech stuff',
      isActive: true,
    });
    categoryId = category._id;

    // 4. Create a product
    const product = await Product.create({
      name: 'Smartphone',
      slug: 'smartphone',
      description: 'A great phone',
      price: 500,
      stock: 10,
      category: categoryId,
      seller: sellerId,
      status: 'published',
      images: ['http://example.com/image.jpg'],
    });
    productId = product._id;
  });

  it('should get the product', async () => {
    const res = await request(app).get(`/api/v1/products/${productId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.name).toBe('Smartphone');
  });

  it('should add product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: productId,
        quantity: 2,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.items[0].product.toString()).toBe(productId.toString());
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('should checkout and create an order', async () => {
    // Assuming checkout endpoint works with the cart
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zipCode: '12345',
        },
        paymentMethod: 'card',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.orderStatus).toBe('pending');
    expect(res.body.data.totalAmount).toBe(1000); // 2 * 500
    orderId = res.body.data._id;
  });

  it('should get the created order', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data._id).toBe(orderId.toString());
  });

  it('should process payment', async () => {
    const res = await request(app)
      .post(`/api/v1/payments/process`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderId: orderId,
        paymentDetails: {
          cardNumber: '4242424242424242', // mock
          expiry: '12/25',
          cvv: '123',
        },
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('completed');
  });
});
