
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { getRecentMessages } from '../handlers/get_recent_messages';

describe('getRecentMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no messages exist', async () => {
    const result = await getRecentMessages();
    expect(result).toEqual([]);
  });

  it('should return messages ordered by created_at descending', async () => {
    // Insert test messages with different timestamps
    const message1 = await db.insert(messagesTable)
      .values({
        content: 'First message',
        role: 'user'
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const message2 = await db.insert(messagesTable)
      .values({
        content: 'Second message',
        role: 'assistant'
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const message3 = await db.insert(messagesTable)
      .values({
        content: 'Third message',
        role: 'user'
      })
      .returning()
      .execute();

    const result = await getRecentMessages();

    expect(result).toHaveLength(3);
    // Should be ordered by created_at descending (newest first)
    expect(result[0].content).toEqual('Third message');
    expect(result[1].content).toEqual('Second message');
    expect(result[2].content).toEqual('First message');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should respect the limit parameter', async () => {
    // Insert 5 test messages
    for (let i = 1; i <= 5; i++) {
      await db.insert(messagesTable)
        .values({
          content: `Message ${i}`,
          role: i % 2 === 0 ? 'assistant' : 'user'
        })
        .execute();
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    const result = await getRecentMessages(3);

    expect(result).toHaveLength(3);
    // Should get the 3 most recent messages
    expect(result[0].content).toEqual('Message 5');
    expect(result[1].content).toEqual('Message 4');
    expect(result[2].content).toEqual('Message 3');
  });

  it('should use default limit of 50 when no limit provided', async () => {
    // Insert 2 messages to verify default behavior works
    await db.insert(messagesTable)
      .values({
        content: 'Test message 1',
        role: 'user'
      })
      .execute();

    await db.insert(messagesTable)
      .values({
        content: 'Test message 2',
        role: 'assistant'
      })
      .execute();

    const result = await getRecentMessages();

    expect(result).toHaveLength(2);
    // Verify it returns all messages when under the default limit
    expect(result.some(msg => msg.content === 'Test message 1')).toBe(true);
    expect(result.some(msg => msg.content === 'Test message 2')).toBe(true);
  });

  it('should return correct message structure', async () => {
    const insertResult = await db.insert(messagesTable)
      .values({
        content: 'Test message content',
        role: 'user'
      })
      .returning()
      .execute();

    const result = await getRecentMessages();

    expect(result).toHaveLength(1);
    const message = result[0];
    
    expect(message.id).toBeDefined();
    expect(typeof message.id).toBe('number');
    expect(message.content).toEqual('Test message content');
    expect(message.role).toEqual('user');
    expect(message.created_at).toBeInstanceOf(Date);
  });

  it('should handle both user and assistant message roles', async () => {
    await db.insert(messagesTable)
      .values({
        content: 'User message',
        role: 'user'
      })
      .execute();

    await db.insert(messagesTable)
      .values({
        content: 'Assistant message',
        role: 'assistant'
      })
      .execute();

    const result = await getRecentMessages();

    expect(result).toHaveLength(2);
    
    const userMessage = result.find(msg => msg.role === 'user');
    const assistantMessage = result.find(msg => msg.role === 'assistant');
    
    expect(userMessage).toBeDefined();
    expect(assistantMessage).toBeDefined();
    expect(userMessage?.content).toEqual('User message');
    expect(assistantMessage?.content).toEqual('Assistant message');
  });

  it('should handle limit of 0', async () => {
    await db.insert(messagesTable)
      .values({
        content: 'Test message',
        role: 'user'
      })
      .execute();

    const result = await getRecentMessages(0);
    expect(result).toEqual([]);
  });
});
