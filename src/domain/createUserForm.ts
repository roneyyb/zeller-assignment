import { z } from 'zod';

export const USER_ROLES = ['Admin', 'Manager'] as const;
export type UserRoleLabel = (typeof USER_ROLES)[number];

const requiredNamePart = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(50, 'Must be 50 characters or less')
  .regex(/^[A-Za-z ]+$/, 'Only alphabets and spaces allowed')
  .refine((v) => /^[A-Z]/.test(v), 'Must start with a capital letter');

const requiredEmail = z
  .string()
  .trim()
  .min(1, 'Required')
  .email('Invalid email')
  // Stricter than Zod's default email check (prevents "a@b" style inputs).
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Invalid email');

export const createUserFormSchema = z.object({
  firstName: requiredNamePart,
  lastName: requiredNamePart,
  email: requiredEmail,
  role: z.enum(USER_ROLES),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export function toApiRole(role: UserRoleLabel) {
  return role.toUpperCase(); // ADMIN / MANAGER
}

export function buildFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

