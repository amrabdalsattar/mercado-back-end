const { z } = require('zod');

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  zipCode: z.string().optional(),
});

exports.placeOrderSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    paymentMethod: z.enum(['card', 'wallet', 'cod']),
    promoCode: z.string().optional(),
    notes: z.string().optional(),
  }),
});

exports.updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed']),
    trackingNumber: z.string().optional(),
    note: z.string().optional(),
  }),
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
