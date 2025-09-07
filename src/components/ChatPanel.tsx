import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onUpdateSRS: (content: string) => void;
}

export const ChatPanel = ({ messages, onSendMessage, isLoading, onUpdateSRS }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <h2 className="text-xl font-semibold text-foreground">Kinesis AI Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Describe your mission goals and requirements
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Welcome to Kinesis SRS Builder
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Start by describing your mission objectives, payload requirements, or key achievements.
                  I'll help you create a comprehensive System Requirements Specification.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="text-left p-3 bg-muted rounded-md">
                  <strong>Example:</strong> "Develop a CubeSat for Earth observation with 10m resolution, 
                  400km orbit, $50k budget"
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <Card
              className={cn(
                'max-w-[80%] p-4 border-card-border',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground'
              )}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-card text-card-foreground p-4 border-card-border">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  AI is thinking...
                </span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your mission goals, requirements, or ask for clarifications..."
              className="min-h-[80px] resize-none pr-12 bg-input border-input-border focus:border-input-focus"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
            <Button
              type="submit"
              variant="kinesis"
              size="sm"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};