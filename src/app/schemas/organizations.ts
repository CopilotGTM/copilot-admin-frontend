import { z } from "zod";

export const urlString = z
  .string()
  .url({ message: "Enter a valid URL" });

export const createOrganizationSchema = z.object({
  organisation_name: z.string().min(1, "Organization name is required"),
  country: z.string().min(1, "Country is required"),
  sales_team_size: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int({ message: "Must be an integer" })
    .min(0, "Cannot be negative")
    .default(0),
  company_address: z.string().min(1, "Company address is required"),
  billing_address: z.string().min(1, "Billing address is required"),
  linked_urls: z.array(urlString).default([]),
  website_urls: z.array(urlString).default([]),
  summary: z.string().min(1, "Summary is required"),
  logo_url: urlString,
});

// Input type (what the form accepts before defaults applied)
export type CreateOrganizationInput = z.input<typeof createOrganizationSchema>;
// Output type (after defaults applied by resolver)
export type CreateOrganizationValues = z.output<typeof createOrganizationSchema>;
