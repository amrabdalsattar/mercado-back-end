const { z } = require('zod');

exports.createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(5).max(2000),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});

exports.updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().min(5).max(2000).optional(),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
