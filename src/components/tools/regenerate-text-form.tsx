"use client";

import { useState } from 'react';
import { regenerateText, type RegenerateTextInput } from '@/ai/flows/regenerate-text';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Download, Copy, Wand2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tone = NonNullable<RegenerateTextInput["tone"]>;
type Length = NonNullable<RegenerateTextInput["length"]>;

export default function RegenerateTextForm() {
  const [originalText, setOriginalText] = useState('');
  const [regeneratedText, setRegeneratedText] = useState('');
  const [tone, setTone] = useState<Tone>("Casual");
  const [length, setLength] = useState<Length>("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!originalText.trim()) {
      setError("Please enter some text to regenerate.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRegeneratedText('');

    try {
      const result = await regenerateText({
        text: originalText,
        tone,
        length,
      });
      setRegeneratedText(result.regeneratedText);
    } catch (e) {
      setError("An error occurred during text regeneration. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (textToCopy: string, type: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied!",
      description: `The ${type} text has been copied to your clipboard.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Regenerate Text</CardTitle>
        <CardDescription>Rewrite text to sound more natural and human-like.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="original-text">Original Text</Label>
            <Textarea
              id="original-text"
              placeholder="Enter the text you want to rewrite..."
              rows={8}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              disabled={isLoading}
              className="pr-12"
            />
            <Button 
                onClick={() => handleCopy(originalText, "original")} 
                variant="ghost" 
                size="icon" 
                type="button"
                className="absolute top-7 right-1"
                disabled={!originalText}
            >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy original text</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone-style">Tone / Style</Label>
              <Select value={tone} onValueChange={(value: Tone) => setTone(value)} disabled={isLoading}>
                <SelectTrigger id="tone-style">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={(value: Length) => setLength(value)} disabled={isLoading}>
                <SelectTrigger id="length">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !originalText.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isLoading ? 'Regenerating...' : 'Regenerate Text'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </form>

      {regeneratedText && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Regenerated Text</h3>
                    <div className="flex gap-2">
                        <Button onClick={() => handleCopy(regeneratedText, "regenerated")} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={() => {
                            const blob = new Blob([regeneratedText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `regenerated_text.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={regeneratedText} readOnly rows={8} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
