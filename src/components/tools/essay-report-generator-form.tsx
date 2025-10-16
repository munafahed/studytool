"use client";

import { useState } from 'react';
import { generateEssayReport, type GenerateEssayReportInput } from '@/ai/flows/ai-essay-report-generation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReportType = GenerateEssayReportInput["reportType"];

export default function EssayReportGeneratorForm() {
  const [text, setText] = useState('');
  const [reportType, setReportType] = useState<ReportType>("Short");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to generate a report.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReport("");
    setProgress(0);

    const progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? 95 : prev + 5));
    }, 500);

    try {
      const result = await generateEssayReport({
        text,
        reportType,
      });
      setReport(result.report);
    } catch (e) {
      setError("An error occurred during generation. Please try again.");
      console.error(e);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    toast({
      title: "Copied!",
      description: "The report has been copied to your clipboard.",
    });
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essay_report_${reportType.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Essay / Report Generator</CardTitle>
        <CardDescription>Generate a short or detailed essay/report from your text.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Your Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter the text or topic for your essay..."
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value: ReportType) => setReportType(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Short">Short</SelectItem>
                <SelectItem value="Detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>

          {isLoading && (
            <div className="space-y-2 pt-2">
                <Label>Processing...</Label>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">Please wait while the AI crafts your report.</p>
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

      {report && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Generated Report</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadReport} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={report} readOnly rows={15} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
