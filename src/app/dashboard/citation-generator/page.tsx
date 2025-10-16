"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Copy, BookCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateCitation } from '@/ai/flows/citation-generator';

const citationStyles = ["APA 7th", "MLA 9th", "Chicago 17th", "Harvard"];

export default function CitationGeneratorPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [citationStyle, setCitationStyle] = useState(citationStyles[0]);
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl.trim()) {
      setError('Please enter a source URL.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedCitation('');

    try {
        const result = await generateCitation({
            sourceUrl,
            citationStyle,
        });
        setGeneratedCitation(result.citation);
    } catch (e) {
        console.error(e);
        setError('Failed to generate citation. Please check the URL and try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCitation) {
      navigator.clipboard.writeText(generatedCitation);
      toast({
        title: "Copied!",
        description: "Citation copied to clipboard.",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Citation Generator</CardTitle>
          <CardDescription>Create citations in various styles like APA, MLA, and more from a URL.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="source-url">Source URL</Label>
              <Input
                id="source-url"
                placeholder="https://example.com/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citation-style">Citation Style</Label>
              <Select value={citationStyle} onValueChange={setCitationStyle} disabled={isLoading}>
                <SelectTrigger id="citation-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {citationStyles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !sourceUrl.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCheck className="mr-2 h-4 w-4" />}
              {isLoading ? 'Generating...' : 'Generate Citation'}
            </Button>
          </CardContent>
        </form>
        {generatedCitation && (
          <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <h3 className="font-headline text-xl font-semibold mb-2">Generated Citation</h3>
                <div className="relative">
                    <Textarea value={generatedCitation} readOnly rows={4} className="bg-secondary/50 pr-12"/>
                    <Button onClick={handleCopy} variant="ghost" size="icon" className="absolute top-2 right-2">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
