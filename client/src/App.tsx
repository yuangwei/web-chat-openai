
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, SendMessageInput } from '../../server/src/schema';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load recent messages on component mount
  const loadRecentMessages = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      const recentMessages = await trpc.getRecentMessages.query({ limit: 50 });
      // Reverse to show chronological order (oldest first)
      setMessages(recentMessages.reverse());
    } catch (error) {
      console.error('Failed to load recent messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadRecentMessages();
  }, [loadRecentMessages]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const messageInput: SendMessageInput = {
      content: inputValue.trim()
    };

    setIsLoading(true);
    try {
      const response = await trpc.sendMessage.mutate(messageInput);
      
      // Add both user and bot messages to the conversation
      setMessages((prev: Message[]) => [
        ...prev,
        response.userMessage,
        response.botResponse
      ]);
      
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 AI Chat Assistant
          </h1>
          <p className="text-gray-600">
            Have a conversation with our AI assistant powered by LangChain
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              💬 Chat Messages
              <Badge variant="secondary" className="bg-white/20 text-white">
                {messages.length} messages
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👋</div>
                    <p className="text-gray-500 text-lg">
                      Start a conversation! Send your first message below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className={`w-8 h-8 ${
                        message.role === 'user' 
                          ? 'bg-blue-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        <AvatarFallback className="text-white text-sm">
                          {message.role === 'user' ? '👤' : '🤖'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-[80%] ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${
                          message.role === 'user' ? 'text-right' : ''
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setInputValue(e.target.value)
                  }
                  placeholder="Type your message here... 💭"
                  disabled={isLoading}
                  className="flex-1 bg-white"
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send 🚀
                    </>
                  )}
                </Button>
              </form>
              
              {inputValue.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {inputValue.length}/1000 characters
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>
            ✨ Powered by LangChain & OpenAI • 
            Built with React & tRPC
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
