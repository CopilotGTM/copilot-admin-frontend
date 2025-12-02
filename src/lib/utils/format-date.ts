import { format } from "date-fns";

/**
 * Format a date string to a readable format
 */
export function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "PPpp");
}

/**
 * Format a date string to a short format (e.g., "Dec 2, 2025")
 */
export function formatDateShort(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "PP");
}
