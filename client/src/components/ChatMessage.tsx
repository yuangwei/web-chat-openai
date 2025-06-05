
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Message } from '../../../server/src/schema';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-500 text-white text-sm">🤖</AvatarFallback>
        </Avatar>
      )}
      
      <Card className={`max-w-[70%] ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {message.created_at.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
      
      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-green-500 text-white text-sm">👤</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
