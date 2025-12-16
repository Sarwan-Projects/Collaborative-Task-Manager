import { z } from 'zod';

/**
 * DTO for user registration
 * Validates email format, name length, and password strength
 */
export const RegisterDto = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long')
});

/**
 * DTO for user login
 */
export const LoginDto = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
});

/**
 * DTO for updating user profile
 */
export const UpdateProfileDto = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
