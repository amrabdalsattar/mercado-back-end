const { z } = require('zod');

exports.createPromoSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive(),
    minOrderAmount: z.coerce.number().optional(),
    maxDiscount: z.coerce.number().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    expiresAt: z.coerce.date(),
    description: z.string().optional(),
  }),
});

exports.updatePromoSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    expiresAt: z.coerce.date().optional(),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
