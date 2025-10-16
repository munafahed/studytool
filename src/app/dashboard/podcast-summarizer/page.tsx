
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Radio, AlertCircle, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { summarizeFile } from '@/ai/flows/file-summarization';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function PodcastSummarizerPage() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUrl('');
      setError('');
      setSummary('');
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !file) {
      setError('Please enter a URL or upload a file.');
      return;
    }
     if (url.trim()) {
      setError('Summarization from URL is not yet implemented.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSummary('');

    try {
        if (file) {
            const fileDataUri = await fileToDataUri(file);
            const result = await summarizeFile({
                fileName: file.name,
                fileDataUri,
                length: 'medium',
            });
            setSummary(result.summary);
        }
    } catch (e) {
        console.error(e);
        setError("An error occurred during summarization. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const downloadSummary = () => {
    if (summary) {
        const blob = new Blob([summary], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'podcast_summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        toast({
            title: "Downloaded!",
            description: "The summary has been downloaded.",
        });
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Podcast Summarizer</CardTitle>
          <CardDescription>Summarize your favorite podcasts using a URL or file upload.</CardDescription>
        </CardHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="file">From File</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <TabsContent value="url">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="podcast-url">Podcast URL</Label>
                  <Input
                    id="podcast-url"
                    placeholder="https://example.com/podcast.mp3"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setFile(null);
                    }}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </TabsContent>
            <TabsContent value="file">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        accept="audio/*,video/*"
                    />
                    {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                </div>
              </CardContent>
            </TabsContent>
            <CardFooter className="flex-col gap-4">
                 <Button type="submit" className="w-full" disabled={isLoading || (!url.trim() && !file)}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radio className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Summarizing...' : 'Generate Summary'}
                </Button>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
            </CardFooter>
          </form>
        </Tabs>
        {summary && (
          <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <h3 className="font-headline text-xl font-semibold mb-2">Generated Summary</h3>
                <Textarea value={summary} readOnly rows={8} className="bg-secondary/50"/>
                 <Button onClick={downloadSummary} variant="outline" className="mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary
                </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
