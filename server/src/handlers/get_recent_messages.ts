
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type Message } from '../schema';
import { desc } from 'drizzle-orm';

export const getRecentMessages = async (limit: number = 50): Promise<Message[]> => {
  try {
    const results = await db.select()
      .from(messagesTable)
      .orderBy(desc(messagesTable.created_at))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to retrieve recent messages:', error);
    throw error;
  }
};
