const { z } = require('zod');

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

exports.createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().optional(),
    description: z.string().optional(),
    parent: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId').optional(),
  }),
});

exports.updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
