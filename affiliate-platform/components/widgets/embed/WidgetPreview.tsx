'use client';

import { useState } from 'react';
import { useWidgetStore } from '@/store/widget-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import SingleQuizWidget from '@/components/widgets/SingleQuizWidget';
import QuizListWidget from '@/components/widgets/QuizListWidget';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WidgetPreview() {
  const { currentConfig, selectedQuizzes, saveConfig } = useWidgetStore();
  const [configName, setConfigName] = useState(
    currentConfig.name || 'Untitled Widget'
  );
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateEmbedUrl = () => {
    const params = new URLSearchParams();
    if (currentConfig.selectedQuizIds.length > 0) {
      params.append('quizIds', currentConfig.selectedQuizIds.join(','));
    }
    params.append('layout', currentConfig.layout);
    const themeEncoded = btoa(
      encodeURIComponent(JSON.stringify(currentConfig.theme))
    );
    params.append('theme', themeEncoded);

    // Construct full URL - adjust domain as needed for your environment
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://yourdomain.com';
    return `${baseUrl}/embed/quizzes?${params.toString()}`;
  };

  const generateEmbedCode = () => {
    const url = generateEmbedUrl();
    const code = `<iframe 
  src="${url}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen
  style="border: none; border-radius: 8px;">
</iframe>`;
    setEmbedCode(code);
  };

  const handleSaveConfig = () => {
    const trimmedName = configName.trim();
    if (trimmedName.length === 0) {
      toast.error('Please enter a valid configuration name.');
      return;
    }
    saveConfig(trimmedName);
    toast.success('Configuration Saved', {
      description: `Widget "${trimmedName}" has been saved successfully.`,
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        toast.success('Copied to Clipboard', {
          description: 'Embed code copied. Paste it on your website.',
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Copy Failed', {
          description: 'Could not copy to clipboard. Please try again.',
        });
      });
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = `embed-widget-${configName
      .toLowerCase()
      .replace(/\s+/g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    toast.success('Downloaded', {
      description: 'Embed code downloaded as HTML file.',
    });
  };

  const hasQuizzes = selectedQuizzes.length > 0;

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your widget will appear on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasQuizzes ? (
            <Alert>
              <AlertDescription>
                Please go back and select at least one quiz to see the preview.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 p-4">
              {currentConfig.layout === 'single' ? (
                <SingleQuizWidget
                  quiz={selectedQuizzes[0]}
                  theme={currentConfig.theme}
                />
              ) : (
                <QuizListWidget
                  quizzes={selectedQuizzes}
                  theme={currentConfig.theme}
                  layout={currentConfig.layout === 'grid' ? 'grid' : 'list'}
                />
              )}
            </div>
          )}

          {/* Preview Stats */}
          {hasQuizzes && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Layout
                </p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 capitalize">
                  {currentConfig.layout}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Quizzes
                </p>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {selectedQuizzes.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Size
                </p>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 capitalize">
                  {currentConfig.theme.fontSize}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Save Configuration</CardTitle>
          <CardDescription>
            Save this configuration for future use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="configName">Widget Name</Label>
            <Input
              id="configName"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="e.g., Knowledge Quiz Widget"
            />
          </div>
          <Button onClick={handleSaveConfig} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Generate Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Embed Code</CardTitle>
          <CardDescription>
            Get the code to embed this widget on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateEmbedCode} className="w-full">
            Generate Embed Code
          </Button>

          {embedCode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="embedCode">Embed Code</Label>
                <Textarea
                  id="embedCode"
                  value={embedCode}
                  readOnly
                  className="font-mono text-xs h-40 bg-muted"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadCode}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                  📋 How to Use
                </h4>
                <ol className="text-sm text-amber-800 dark:text-amber-200 space-y-2 list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>Go to your website's HTML editor or page builder</li>
                  <li>Paste the code where you want the widget to appear</li>
                  <li>Save your page - the widget is now live!</li>
                </ol>
              </div>

              {/* URL for Reference */}
              <div className="space-y-2 p-4 rounded-lg bg-muted border border-border">
                <Label htmlFor="widgetUrl" className="text-xs font-semibold">
                  Widget URL
                </Label>
                <Textarea
                  id="widgetUrl"
                  value={generateEmbedUrl()}
                  readOnly
                  className="font-mono text-xs h-16 bg-background"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {embedCode && (
        <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <div className="w-200 flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your widget is ready! Copy the code above and embed it on your
              website.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
