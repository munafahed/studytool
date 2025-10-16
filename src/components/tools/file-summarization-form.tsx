"use client";

import { useState } from 'react';
import { summarizeFile, type SummarizeFileInput } from '@/ai/flows/file-summarization';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File as FileIcon, Download, Loader2, AlertCircle } from "lucide-react";

type SummaryLength = SummarizeFileInput["length"];

export default function FileSummarizationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummary("");
      setError("");
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to summarize.");
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
      const fileDataUri = await fileToDataUri(file);
      const result = await summarizeFile({
        fileName: file.name,
        fileDataUri,
        length: summaryLength,
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

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileNameWithoutExt = file?.name.split('.').slice(0, -1).join('.') || 'summary';
    a.download = `${fileNameWithoutExt}_${summaryLength}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">File Summarization</CardTitle>
        <CardDescription>Upload a document and get a concise summary in seconds.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="relative">
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={isLoading}
                />
                <Button asChild variant="outline" className="w-full" >
                    <label htmlFor="file-upload" className={`flex items-center gap-2 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <Upload className="h-4 w-4" />
                        <span>{file ? 'Change file' : 'Choose a file'}</span>
                    </label>
                </Button>
            </div>
            {file && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                <FileIcon className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary-length">Summary Length</Label>
            <Select
              value={summaryLength}
              onValueChange={(value: SummaryLength) => setSummaryLength(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="summary-length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Summarizing...' : 'Summarize File'}
          </Button>

          {isLoading && (
            <div className="space-y-2 pt-2">
                <Label>Processing...</Label>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">Please wait while we analyze your document.</p>
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
          <div>
            <h3 className="font-headline text-xl font-semibold">Your Summary</h3>
          </div>
          <Textarea value={summary} readOnly rows={10} className="bg-secondary/50"/>
          <Button onClick={downloadSummary} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
