
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type SendMessageInput } from '../schema';
import { sendMessage } from '../handlers/send_message';
import { eq } from 'drizzle-orm';

// Test input
const testInput: SendMessageInput = {
  content: 'Hello, how are you?'
};

describe('sendMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create user and bot messages', async () => {
    const result = await sendMessage(testInput);

    // Validate user message
    expect(result.userMessage.content).toEqual('Hello, how are you?');
    expect(result.userMessage.role).toEqual('user');
    expect(result.userMessage.id).toBeDefined();
    expect(result.userMessage.created_at).toBeInstanceOf(Date);

    // Validate bot response
    expect(result.botResponse.content).toBeDefined();
    expect(result.botResponse.role).toEqual('assistant');
    expect(result.botResponse.id).toBeDefined();
    expect(result.botResponse.created_at).toBeInstanceOf(Date);
    expect(result.botResponse.id).not.toEqual(result.userMessage.id);
  });

  it('should save both messages to database', async () => {
    const result = await sendMessage(testInput);

    // Query user message from database
    const userMessages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.userMessage.id))
      .execute();

    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].content).toEqual('Hello, how are you?');
    expect(userMessages[0].role).toEqual('user');
    expect(userMessages[0].created_at).toBeInstanceOf(Date);

    // Query bot message from database
    const botMessages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.botResponse.id))
      .execute();

    expect(botMessages).toHaveLength(1);
    expect(botMessages[0].content).toBeDefined();
    expect(botMessages[0].role).toEqual('assistant');
    expect(botMessages[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate meaningful bot response', async () => {
    const result = await sendMessage(testInput);

    // Bot response should contain some content
    expect(result.botResponse.content.length).toBeGreaterThan(0);
    expect(typeof result.botResponse.content).toBe('string');
    
    // In test environment, should contain reference to user message
    expect(result.botResponse.content).toMatch(/Hello, how are you\?|test response|AI Response/i);
  });

  it('should handle different message content', async () => {
    const differentInput: SendMessageInput = {
      content: 'What is the weather like today?'
    };

    const result = await sendMessage(differentInput);

    expect(result.userMessage.content).toEqual('What is the weather like today?');
    expect(result.botResponse.content).toMatch(/What is the weather like today\?|test response|AI Response/i);
  });

  it('should create messages with different timestamps', async () => {
    const result = await sendMessage(testInput);

    // Both messages should have timestamps
    expect(result.userMessage.created_at).toBeInstanceOf(Date);
    expect(result.botResponse.created_at).toBeInstanceOf(Date);
    
    // Bot response should be created after or at the same time as user message
    expect(result.botResponse.created_at.getTime()).toBeGreaterThanOrEqual(
      result.userMessage.created_at.getTime()
    );
  });

  it('should handle long message content', async () => {
    const longInput: SendMessageInput = {
      content: 'This is a very long message that contains many words and should be handled properly by the system without any issues or truncation problems.'
    };

    const result = await sendMessage(longInput);

    expect(result.userMessage.content).toEqual(longInput.content);
    expect(result.botResponse.content).toBeDefined();
    expect(result.botResponse.content.length).toBeGreaterThan(0);
  });
});
