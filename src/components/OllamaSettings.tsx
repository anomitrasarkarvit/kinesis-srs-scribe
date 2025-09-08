import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ollamaService } from '@/services/ollamaService';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, RefreshCw } from 'lucide-react';

export const OllamaSettings = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    ollamaService.getBaseURL?.() || localStorage.getItem('ollamaBaseURL') || 'http://localhost:11434'
  );
  const [model, setModel] = useState(
    ollamaService.getModel?.() || localStorage.getItem('ollamaModel') || 'llama3.2'
  );
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Prefill from service/localStorage when dialog opens
    if (open) {
      const savedBase = localStorage.getItem('ollamaBaseURL');
      const savedModel = localStorage.getItem('ollamaModel');
      if (savedBase) setBaseUrl(savedBase);
      if (savedModel) setModel(savedModel);
    }
  }, [open]);

  const loadModels = async () => {
    try {
      setLoadingModels(true);
      ollamaService.setBaseURL(baseUrl);
      const list = await ollamaService.getAvailableModels();
      setModels(list);
      if (list.length === 0) {
        toast({
          title: 'No models found',
          description: 'Ensure Ollama is running and your URL is accessible (consider a tunnel if remote).',
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: 'Failed to load models',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoadingModels(false);
    }
  };

  const testAndSave = async () => {
    try {
      setTesting(true);
      ollamaService.setBaseURL(baseUrl);
      const ok = await ollamaService.testConnection();
      if (!ok) throw new Error('Connection failed. Endpoint unreachable or blocked by CORS.');
      ollamaService.setModel(model);
      localStorage.setItem('ollamaBaseURL', baseUrl);
      localStorage.setItem('ollamaModel', model);
      toast({ title: 'Connected', description: 'Settings saved.' });
      setOpen(false);
    } catch (e) {
      toast({
        title: 'Connection Error',
        description: e instanceof Error ? e.message : 'Failed to connect',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Ollama Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ollama Connection</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
            <p className="text-xs text-muted-foreground">
              If you run this app in the cloud preview, localhost is not reachable. Expose your local Ollama via
              a tunnel (ngrok, Cloudflare Tunnel) and paste the public URL here.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <div className="flex items-center gap-2">
              <div className="min-w-[220px]">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={loadModels} disabled={loadingModels}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {loadingModels ? 'Loading…' : 'Load models'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Or type manually:</p>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="llama3.2" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={testAndSave} disabled={testing}>
            {testing ? 'Testing…' : 'Test & Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};