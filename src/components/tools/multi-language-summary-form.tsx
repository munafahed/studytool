"use client";

import { useState } from 'react';
import { multiLanguageSummarization, type MultiLanguageSummarizationInput } from '@/ai/flows/multi-language-summarization';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Download, Copy, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MultiLanguageSummaryForm() {
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [summaryLanguage, setSummaryLanguage] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSummary("");
    setProgress(0);

    const progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? 95 : prev + 5));
    }, 500);

    try {
      const result = await multiLanguageSummarization({
        text,
        sourceLanguage,
        summaryLanguage,
      });
      setSummary(result.summary);
    } catch (e) {
      setError("An error occurred during summarization. Please try again.");
      console.error(e);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "The summary has been copied to your clipboard.",
    });
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${summaryLanguage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Russian"];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Multi-language Summarization</CardTitle>
        <CardDescription>Summarize text from one language into another effortlessly.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Your Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter the text you want to summarize..."
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="source-language">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={isLoading}>
                    <SelectTrigger id="source-language">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="target-language">Summary Language</Label>
                <Select value={summaryLanguage} onValueChange={setSummaryLanguage} disabled={isLoading}>
                    <SelectTrigger id="target-language">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </Button>

          {isLoading && (
            <div className="space-y-2 pt-2">
                <Label>Processing...</Label>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">Please wait while the AI generates your summary.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </form>

      {summary && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Generated Summary</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadSummary} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={summary} readOnly rows={15} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
