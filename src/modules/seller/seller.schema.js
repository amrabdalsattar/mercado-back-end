const { z } = require('zod');

exports.registerSellerSchema = z.object({
  body: z.object({
    brandName: z.string().min(2).max(100),
    bio: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
  }),
});

exports.updateSellerSchema = z.object({
  body: z.object({
    brandName: z.string().min(2).max(100).optional(),
    bio: z.string().optional(),
    logo: z.string().optional(),
  }),
});

exports.payoutRequestSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
  }),
});
