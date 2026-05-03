const { z } = require('zod');

const objectIdRegex = /^[a-f\d]{24}$/i;

exports.createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    price: z.coerce.number().positive(),
    salePrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().nonnegative(),
    category: z.string().regex(objectIdRegex, 'Invalid category ID'),
    sku: z.string().optional(),
    tags: z.array(z.string()).optional(),
    currency: z.string().optional(),
  }),
});

exports.updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().positive().optional(),
    salePrice: z.coerce.number().positive().nullable().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    category: z.string().regex(objectIdRegex).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({ id: z.string().regex(objectIdRegex) }),
});

exports.productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rating: z.coerce.number().optional(),
    inStock: z.string().optional(),
    seller: z.string().optional(),
    fields: z.string().optional(),
  }),
});
