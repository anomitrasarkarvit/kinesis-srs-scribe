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
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: this.formatMessages(messages),
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
    // Format messages for Llama 3.2 prompt structure
    let prompt = "You are Kinesis, an AI assistant specialized in creating System Requirements Specifications (SRS) for aerospace and engineering projects. Your role is to:\n\n";
    prompt += "1. Ask clarifying questions about mission objectives, technical requirements, and constraints\n";
    prompt += "2. Generate comprehensive, well-structured SRS documents in Markdown format\n";
    prompt += "3. Iterate on the SRS based on user feedback\n";
    prompt += "4. Ensure all requirements are specific, measurable, and technically feasible\n\n";
    
    prompt += "When generating SRS content, use proper Markdown formatting with:\n";
    prompt += "- Clear headings (# ## ###)\n";
    prompt += "- Bulleted and numbered lists\n";
    prompt += "- Tables for specifications\n";
    prompt += "- Bold text for important requirements\n\n";

    // Add conversation history
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });

    prompt += "Assistant: ";
    return prompt;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
}

// Singleton instance
export const ollamaService = new OllamaService();