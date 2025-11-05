import { z } from 'zod';

/**
 * Validation schemas for all authentication forms
 * Using Zod for type-safe validation with TypeScript inference
 */

// Common patterns
const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters');

// Registration schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string(), // Hidden field
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Profile update schema
export const updateProfileSchema = z.object({
  name: nameSchema,
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Email verification schema
export const emailVerificationSchema = z.object({
  email: emailSchema,
});

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;

// API token creation schema
export const createApiTokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Token name is required')
    .max(255, 'Token name must be less than 255 characters'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateApiTokenFormData = z.infer<typeof createApiTokenSchema>;

// Account deletion confirmation schema
export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((val) => val === 'DELETE', {
      message: 'You must type DELETE to confirm account deletion',
    }),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// Avatar upload schema (file validation)
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'File size must be less than 2MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
});

export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;
