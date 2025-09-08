export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private baseURL: string;
  private model: string;

  constructor(baseURL: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.baseURL = baseURL;
    this.model = model;
  }

  async *streamGenerate(
    messages: Array<{ role: string; content: string }>,
    onUpdate?: (content: string) => void
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let accumulatedContent = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaResponse = JSON.parse(line);
              
              if (data.message?.content) {
                accumulatedContent += data.message.content;
                onUpdate?.(accumulatedContent);
                yield data.message.content;
              }

              if (data.done) {
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse Ollama response line:', line, parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Ollama streaming error:', error);
      throw new Error(
        error instanceof Error 
          ? `Ollama connection failed: ${error.message}. Please ensure Ollama is running on ${this.baseURL}`
          : 'Unknown Ollama error occurred'
      );
    }
  }

  private formatMessages(messages: Array<{ role: string; content: string }>): string {
    // Simple concatenation for chat models
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n') + '\n\nAssistant: ';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  // Getters for current settings
  getBaseURL(): string {
    return this.baseURL;
  }

  getModel(): string {
    return this.model;
  }

  // Setters for updating settings
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  setModel(model: string): void {
    this.model = model;
  }
}

// Singleton instance
export const ollamaService = new OllamaService();