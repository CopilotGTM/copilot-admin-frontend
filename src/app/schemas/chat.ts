import { z } from "zod";

export const createChatSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters!"),
});

export const sendMessageSchema = z.object({
  content: z.string().min(0, "Content can be any characters!"),
  session_id: z.string().uuid("Invalid session ID format"),
  //role: z.literal("user"),
  role: z.union([z.literal("user"), z.literal("assistant")], {
    message: "Role must be either 'user' or 'assistant'",
  }),
  message_id: z.string().uuid("Invalid message ID format"), // UUID for message_id
  timestamp: z.string().datetime({ message: "Invalid ISO8601 timestamp" }), // Validate ISO8601 format
  //is_edited: z.boolean(), // Default to false
  message_type: z.union([
    z.literal("GENERAL_MESSAGE"),
    z.literal("RFP_SHEET"),
    z.literal("TECHNICAL_DECK"),
    z.string().min(1, "Message type cannot be empty"), // allows other string types
  ]),
  message_version: z.number(),
  attachments: z.any().nullable().optional(), // adjust based on your actual structure
});

// Schema for file upload request
export const fileUploadSchema = z.object({
  file_name: z.string().min(1, "File name is required"),
  file_type: z.string().min(1, "File type is required"),
  file_size: z.number().min(1, "File size must be greater than 0"),
  session_id: z.string().uuid("Invalid session ID format"),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
