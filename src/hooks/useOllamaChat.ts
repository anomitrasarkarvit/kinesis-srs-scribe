import { useState, useCallback, useRef } from 'react';
import { ollamaService } from '@/services/ollamaService';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useOllamaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [srsContent, setSrsContent] = useState('');
  const [isUpdatingSRS, setIsUpdatingSRS] = useState(false);
  const { toast } = useToast();

  // Ref to avoid stale closure issues
  const messagesRef = useRef<ChatMessage[]>([]);
  const updateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages(prev => {
      const updated = updater(prev);
      messagesRef.current = updated;
      return updated;
    });
  };

  const generateId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    updateMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantMessage: ChatMessage | null = null;

    try {
      console.log('Testing Ollama connection...');
      const isConnected = await ollamaService.testConnection();
      if (!isConnected) {
        throw new Error(
          'Cannot connect to Ollama. Please ensure it is running on http://localhost:11434'
        );
      }
      console.log('Ollama connection successful');

      const conversationMessages = [...messagesRef.current, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let assistantResponse = '';
      assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Insert placeholder assistant message for streaming
      updateMessages(prev => [...prev, assistantMessage]);
      console.log('Starting stream with assistant message ID:', assistantMessage.id);

      // Stream response
      for await (const chunk of ollamaService.streamGenerate(
        conversationMessages,
        (accumulatedContent) => {
          assistantResponse = accumulatedContent;
          updateMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage!.id
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }
      )) {
        // chunks handled in callback
      }

      console.log('Streaming completed. Final response:', assistantResponse);

      // Detect and extract SRS content with better patterns
      const srsPatterns = [
        /```(?:markdown)?\s*([\s\S]*?)\s*```/i,  // Markdown code blocks
        /(# [^#\n]*(?:SRS|System Requirements|Requirements Specification)[\s\S]*)/i,  // SRS headings
        /(# [^#\n]*(?:Project|System|Software)[\s\S]*)/i,  // Project/System docs
        /(## [^#\n]*(?:Requirements|Specification|Overview)[\s\S]*)/i,  // Requirements sections
      ];

      let extractedSRS = '';
      for (const pattern of srsPatterns) {
        const match = assistantResponse.match(pattern);
        if (match) {
          extractedSRS = (match[1] || match[0]).trim();
          break;
        }
      }

      if (extractedSRS) {
        setIsUpdatingSRS(true);
        setSrsContent(extractedSRS);
        setIsUpdatingSRS(false);
      } else if (assistantResponse.includes('# ') || assistantResponse.includes('## ')) {
        // Heuristic: looks like structured markdown
        setIsUpdatingSRS(true);
        setSrsContent(assistantResponse.trim());
        setIsUpdatingSRS(false);
      }

    } catch (error) {
      console.error('Ollama chat error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to communicate with Ollama';

      toast({
        title: 'Chat Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Keep partial assistant response if available
      if (assistantMessage && !assistantMessage.content) {
        updateMessages(prev => prev.filter(msg => msg.id !== assistantMessage!.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast]);

  const updateSRS = useCallback((content: string) => {
    setIsUpdatingSRS(true);
    setSrsContent(content);
    setIsUpdatingSRS(false);
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setSrsContent('');
    setIsUpdatingSRS(false);
  }, []);

  return {
    messages,
    isLoading,
    srsContent,
    isUpdatingSRS,
    sendMessage,
    updateSRS,
    resetConversation,
  };
};