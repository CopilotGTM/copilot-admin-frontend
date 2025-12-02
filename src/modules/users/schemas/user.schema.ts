import { z } from "zod";

export const userRoleEnum = z.enum(["member", "admin"], {
  required_error: "User role is required",
  invalid_type_error: "Invalid user role",
});

export const createUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  organisation_id: z.string().uuid("Invalid organization id"),
  user_role: userRoleEnum,
  job_title: z.string().optional(),
  organisation_role: z.string().min(1, "Organization role is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.omit({ organisation_id: true, email: true }).partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
