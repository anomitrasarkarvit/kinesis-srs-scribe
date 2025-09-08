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

    // Helper function to detect and update SRS content
    const detectAndUpdateSRS = (content: string): boolean => {
      console.log('Detecting SRS content from:', content.substring(0, 100) + '...');
      
      // If content is substantial (more than 50 chars) and different from current SRS, update it
      const trimmedContent = content.trim();
      
      if (trimmedContent.length > 50 && trimmedContent !== srsContent) {
        console.log('Updating SRS content with new response');
        setIsUpdatingSRS(true);
        setSrsContent(trimmedContent);
        setTimeout(() => setIsUpdatingSRS(false), 100); // Brief delay to show updating state
        return true;
      }
      
      return false;
    };

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
          
          // Real-time SRS content detection during streaming
          const shouldUpdateSRS = detectAndUpdateSRS(accumulatedContent);
          if (shouldUpdateSRS) {
            console.log('SRS content detected during streaming');
          }
        }
      )) {
        // chunks handled in callback
      }

      console.log('Streaming completed. Final response:', assistantResponse);

      // Final SRS content detection
      detectAndUpdateSRS(assistantResponse);

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
  }, [isLoading, toast, srsContent]);

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