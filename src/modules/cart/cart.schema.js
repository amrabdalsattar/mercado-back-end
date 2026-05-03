const { z } = require('zod');

const objectIdRegex = /^[a-f\d]{24}$/i;

exports.addItemSchema = z.object({
  body: z.object({
    productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
    quantity: z.coerce.number().int().positive(),
  }),
});

exports.updateItemSchema = z.object({
  body: z.object({ quantity: z.coerce.number().int().positive() }),
  params: z.object({ productId: z.string().regex(objectIdRegex) }),
});

exports.applyCouponSchema = z.object({
  body: z.object({ code: z.string().min(1) }),
});
