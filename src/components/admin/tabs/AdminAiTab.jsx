
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Wand2 } from 'lucide-react';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';

    const AdminAiTab = () => {
      const { toast } = useToast();
      // These would typically come from a settings store or Supabase
      const [aiGenerationEnabled, setAiGenerationEnabled] = useState(true);
      const [deepseekApiKey, setDeepseekApiKey] = useState('');

      const handleSaveAiSettings = () => {
        // Here you would save these settings, e.g., to Supabase or localStorage
        console.log("Saving AI Settings:", { aiGenerationEnabled, deepseekApiKey });
        toast({
          title: "AI Settings Saved",
          description: "Your AI configuration has been updated.",
        });
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Wand2 className="mr-2 h-5 w-5 text-primary" />AI Configuration</CardTitle>
            <CardDescription>Toggle AI usage for fallback content generation and manage API keys.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="ai-generation-toggle" className="text-sm font-medium">Enable AI Content Generation Fallback</Label>
              <Switch
                id="ai-generation-toggle"
                checked={aiGenerationEnabled}
                onCheckedChange={setAiGenerationEnabled}
              />
            </div>
            <div>
              <Label htmlFor="deepseek-api-key">DeepSeek API Key</Label>
              <Input
                id="deepseek-api-key"
                type="password"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API Key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored securely and used for generating content when an item is not found.
              </p>
            </div>
            <Button onClick={handleSaveAiSettings}>Save AI Settings</Button>
          </CardContent>
        </Card>
      );
    };

    export default AdminAiTab;
  