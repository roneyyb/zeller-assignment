import { z } from 'zod';

export const USER_ROLES = ['Admin', 'Manager'] as const;
export type UserRoleLabel = (typeof USER_ROLES)[number];

const requiredNamePart = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(50, 'Must be 50 characters or less')
  .regex(/^[A-Za-z ]+$/, 'Only alphabets and spaces allowed');

const optionalNamePart = z
  .string()
  .trim()
  .max(50, 'Must be 50 characters or less')
  .regex(/^[A-Za-z ]*$/, 'Only alphabets and spaces allowed');

export const createUserFormSchema = z.object({
  firstName: requiredNamePart,
  lastName: optionalNamePart,
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Invalid email'),
  role: z.enum(USER_ROLES),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export function toApiRole(role: UserRoleLabel) {
  return role.toUpperCase(); // ADMIN / MANAGER
}

export function buildFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

