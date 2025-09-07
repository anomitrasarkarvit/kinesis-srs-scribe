import { useEffect } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { SRSPreview } from '@/components/SRSPreview';
import { OllamaSettings } from '@/components/OllamaSettings';
import { useOllamaChat } from '@/hooks/useOllamaChat';
import { exportService } from '@/services/exportService';
import { ollamaService } from '@/services/ollamaService';
import { Button } from '@/components/ui/button';
import { RotateCcw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { messages, isLoading, srsContent, isUpdatingSRS, sendMessage, updateSRS, resetConversation } = useOllamaChat();
  const { toast } = useToast();

  // Initialize Ollama service from saved settings on mount
  useEffect(() => {
    const savedBase = localStorage.getItem('ollamaBaseURL');
    const savedModel = localStorage.getItem('ollamaModel');
    if (savedBase) (ollamaService as any).baseURL = savedBase;
    if (savedModel) (ollamaService as any).model = savedModel;
  }, []);

  const handleExport = async (format: 'md' | 'pdf') => {
    if (!srsContent) {
      toast({
        title: "No Content",
        description: "Please generate SRS content before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = exportService.generateFilename('kinesis-srs');
      
      if (format === 'md') {
        await exportService.exportAsMarkdown(srsContent, filename);
        toast({
          title: "Export Successful",
          description: "SRS document exported as Markdown file.",
        });
      } else {
        await exportService.exportAsPDF(srsContent, filename);
        toast({
          title: "Export Successful", 
          description: "SRS document exported as PDF file.",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export document",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Session Reset",
      description: "Started a new SRS building session.",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Kinesis</h1>
              </div>
              <div className="h-6 w-px bg-border" />
              <p className="text-muted-foreground">
                AI-Powered System Requirements Specification Builder
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <OllamaSettings />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Session</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-1/2 border-r border-border bg-background">
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onUpdateSRS={updateSRS}
          />
        </div>

        {/* Right Panel - SRS Preview */}
        <div className="w-1/2 bg-background">
          <SRSPreview
            content={srsContent}
            isUpdating={isUpdatingSRS}
            onExport={handleExport}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
