
import { z } from 'zod';

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  content: z.string(),
  role: z.enum(['user', 'assistant']),
  created_at: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

// Input schema for sending messages
export const sendMessageInputSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(1000, 'Message too long')
});

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

// Chat response schema
export const chatResponseSchema = z.object({
  userMessage: messageSchema,
  botResponse: messageSchema
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
