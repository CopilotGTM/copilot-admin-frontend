import { z } from "zod";

export const generateOutlineSchema = z.object({
  message_id: z.string().uuid("Invalid message ID format"), // UUID for message_id
  session_id: z.string().uuid("Invalid message ID format"), // Validate ISO8601 format
});

export const generateDeckSchema = z.object({
  system_message_id: z.string().uuid("Invalid message ID format"), // UUID for message_id
  session_id: z.string().uuid("Invalid message ID format"), // Validate ISO8601 format
});

export type GenerateOutlineInput = z.infer<typeof generateOutlineSchema>;
export type GenerateDeckInput = z.infer<typeof generateDeckSchema>;
