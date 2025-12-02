import { z } from "zod";

export const urlString = z
  .string()
  .url({ message: "Enter a valid URL" })
  .or(z.literal(""));

export const createOrganizationSchema = z.object({
  organisation_name: z.string().min(1, "Organization name is required"),
  country: z.string().optional(),
  sales_team_size: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int({ message: "Must be an integer" })
    .min(0, "Cannot be negative")
    .optional(),
  company_address: z.string().optional(),
  linked_urls: z.array(urlString).optional().default([]),
  website_urls: z.array(urlString).optional().default([]),
  summary: z.string().optional(),
  logo_url: urlString.optional(),
});

// Input type (what the form accepts before defaults applied)
export type CreateOrganizationInput = z.input<typeof createOrganizationSchema>;
// Output type (after defaults applied by resolver)
export type CreateOrganizationValues = z.output<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial();
export type UpdateOrganizationInput = z.input<typeof updateOrganizationSchema>;
