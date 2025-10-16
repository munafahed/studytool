"use client";

import { useState } from 'react';
import { detectAiContent } from '@/ai/flows/ai-detector';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Download, Copy, ScanSearch, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AiDetectorForm() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ aiProbability: number; summary: string } | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileText = e.target?.result as string;
        setText(fileText);
        toast({ title: "File loaded", description: `${file.name} content has been loaded into the text area.`});
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      }
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text or upload a file to analyze.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const analysisResult = await detectAiContent({ text });
      setResult(analysisResult);
    } catch (e) {
      setError("An error occurred during analysis. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProgressColor = (probability: number) => {
    if (probability > 70) return "bg-red-500";
    if (probability > 40) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Detector</CardTitle>
        <CardDescription>Analyze text to determine the probability of it being AI-generated.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Text to Analyze</Label>
            <Textarea
              id="input-text"
              placeholder="Paste the text you want to analyze here..."
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-center">
             <input
                type="file"
                id="file-upload"
                className="sr-only"
                onChange={handleFileChange}
                accept=".txt,.md,.doc,.docx"
                disabled={isLoading}
              />
              <Button asChild variant="link">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <FileUp className="mr-2 h-4 w-4" />
                  Or upload a file
                </Label>
              </Button>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
            {isLoading ? 'Analyzing...' : 'Analyze AI Content'}
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

      {result && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full space-y-4'>
                <h3 className="font-headline text-xl font-semibold">Analysis Result</h3>
                <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">AI Probability</span>
                            <span className={`font-bold text-lg ${getProgressColor(result.aiProbability).replace('bg-', 'text-')}`}>{result.aiProbability.toFixed(0)}%</span>
                        </div>
                        <Progress value={result.aiProbability} className={`h-3 [&>div]:${getProgressColor(result.aiProbability)}`} />
                        <p className="text-sm text-muted-foreground mt-3 text-center">{result.summary}</p>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <Button onClick={() => { navigator.clipboard.writeText(`AI Probability: ${result.aiProbability.toFixed(0)}%\nSummary: ${result.summary}`); toast({title: "Result Copied!"})}} variant="outline" className="w-full">
                        <Copy className="mr-2 h-4 w-4" /> Copy Result
                    </Button>
                    <Button onClick={() => {
                        const blob = new Blob([`AI Probability: ${result.aiProbability.toFixed(0)}%\n\n${result.summary}\n\nOriginal Text:\n${text}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ai_analysis_result.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
