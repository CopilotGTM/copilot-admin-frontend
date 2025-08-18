import { z } from "zod";

export const generateAnswersSchema = z.object({
  system_message_id: z.string().uuid("Invalid message ID format"),
  session_id: z.string().uuid("Invalid session ID format"), // Fixed error message
  sheets_details: z
    .array(
      z.object({
        sheet_name: z.string().min(1, "Sheet name cannot be empty"),
        question_column: z.string().min(1, "Question column cannot be empty"),
        answer_column: z.string().min(1, "Answer column cannot be empty"),
      }),
    )
    .min(1, "At least one sheet detail is required"),
});

export type GenerateAnswersInput = z.infer<typeof generateAnswersSchema>;
