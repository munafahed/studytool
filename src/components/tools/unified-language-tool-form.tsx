"use client";

import { useState } from 'react';
import { unifiedLanguageTool, type UnifiedLanguageToolInput } from '@/ai/flows/unified-language-tool';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Download, Copy, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '../ui/checkbox';

export default function UnifiedLanguageToolForm() {
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [operations, setOperations] = useState({
    grammarCheck: false,
    rewrite: false,
    translate: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [processedText, setProcessedText] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to process.");
      return;
    }
    if (!operations.grammarCheck && !operations.rewrite && !operations.translate) {
      setError("Please select at least one operation.");
      return;
    }

    setIsLoading(true);
    setError("");
    setProcessedText("");

    try {
      const input: UnifiedLanguageToolInput = {
        text,
        ...operations,
      };
      if (operations.translate) {
        input.sourceLanguage = sourceLanguage || undefined; // Auto-detect if not set
        input.targetLanguage = targetLanguage;
      }

      const result = await unifiedLanguageTool(input);
      setProcessedText(result.processedText);
    } catch (e) {
      setError("An error occurred during processing. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(processedText);
    toast({
      title: "Copied!",
      description: "The processed text has been copied to your clipboard.",
    });
  };

  const downloadText = () => {
    const blob = new Blob([processedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Russian"];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Unified Language Tools</CardTitle>
        <CardDescription>Correct grammar, rewrite, or translate your text all in one place.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Your Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter your text here..."
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-4">
              <h3 className="font-semibold text-sm">Operations</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                      <Checkbox id="grammar-check" checked={operations.grammarCheck} onCheckedChange={(checked) => setOperations(prev => ({...prev, grammarCheck: !!checked}))} disabled={isLoading} />
                      <Label htmlFor="grammar-check">Grammar/Spelling Correction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="rewrite" checked={operations.rewrite} onCheckedChange={(checked) => setOperations(prev => ({...prev, rewrite: !!checked}))} disabled={isLoading} />
                      <Label htmlFor="rewrite">Rewrite/Paraphrase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="translate" checked={operations.translate} onCheckedChange={(checked) => setOperations(prev => ({...prev, translate: !!checked}))} disabled={isLoading} />
                      <Label htmlFor="translate">Translate</Label>
                  </div>
              </div>
          </div>

          {operations.translate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                    <Label htmlFor="source-language">Source Language</Label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={isLoading}>
                        <SelectTrigger id="source-language">
                            <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Auto-detect</SelectItem>
                            {languages.map(lang => <SelectItem key={`src-${lang}`} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="target-language">Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isLoading}>
                        <SelectTrigger id="target-language">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => <SelectItem key={`tgt-${lang}`} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Process Text'}
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

      {processedText && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Processed Output</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadText} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={processedText} readOnly rows={8} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
