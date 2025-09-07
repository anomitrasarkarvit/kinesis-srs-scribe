import { useState, useCallback } from 'react';
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

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Test connection first
      const isConnected = await ollamaService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to Ollama. Please ensure it is running on http://localhost:11434');
      }

      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let assistantResponse = '';
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add the assistant message immediately for streaming
      setMessages(prev => [...prev, assistantMessage]);

      // Stream the response
      for await (const chunk of ollamaService.streamGenerate(
        conversationMessages,
        (accumulatedContent) => {
          // Update the assistant message content as it streams
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
          assistantResponse = accumulatedContent;
        }
      )) {
        // The streaming is handled by the onUpdate callback above
      }

      // Check if the response contains SRS content and extract it
      const srsMatch = assistantResponse.match(/```markdown\n([\s\S]*?)\n```/) || 
                     assistantResponse.match(/# System Requirements Specification[\s\S]*/);
      
      if (srsMatch) {
        setIsUpdatingSRS(true);
        const extractedSRS = srsMatch[1] || srsMatch[0];
        setSrsContent(extractedSRS);
        setTimeout(() => setIsUpdatingSRS(false), 500); // Brief loading state
      } else if (assistantResponse.includes('# ') || assistantResponse.includes('## ')) {
        // If it looks like markdown content, treat it as SRS
        setIsUpdatingSRS(true);
        setSrsContent(assistantResponse);
        setTimeout(() => setIsUpdatingSRS(false), 500);
      }

    } catch (error) {
      console.error('Ollama chat error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to communicate with Ollama';

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== messages.length.toString()));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, toast]);

  const updateSRS = useCallback((content: string) => {
    setIsUpdatingSRS(true);
    setSrsContent(content);
    setTimeout(() => setIsUpdatingSRS(false), 300);
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
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