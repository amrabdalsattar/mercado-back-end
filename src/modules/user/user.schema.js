const { z } = require('zod');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

exports.registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().regex(passwordRegex, 'Password must be ≥8 chars with upper, lower and number'),
    phone: z.string().optional(),
  }),
});

exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

exports.forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email() }),
});

exports.resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().regex(passwordRegex, 'Password must be ≥8 chars with upper, lower and number'),
  }),
});

exports.updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60).optional(),
    phone: z.string().optional(),
  }),
});

exports.addAddressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    country: z.string().min(1),
    zipCode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});
