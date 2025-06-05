
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import type { SendMessageInput } from '../../../server/src/schema';

interface ChatInputProps {
  onSendMessage: (input: SendMessageInput) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageContent = message.trim();
    setMessage(''); // Clear input immediately for better UX
    
    try {
      await onSendMessage({ content: messageContent });
    } catch (error) {
      // If there's an error, restore the message
      setMessage(messageContent);
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        className="flex-1 min-h-[60px] max-h-[120px] resize-none"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading}
        className="self-end px-6"
      >
        {isLoading ? '⏳' : '💬'}
      </Button>
    </form>
  );
}
