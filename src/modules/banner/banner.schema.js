const { z } = require('zod');

exports.createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    link: z.string().url().optional(),
    order: z.coerce.number().optional(),
  }),
});

exports.updateBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    link: z.string().url().optional(),
    order: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
