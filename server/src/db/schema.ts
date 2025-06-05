
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define message role enum
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  role: messageRoleEnum('role').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { messages: messagesTable };
