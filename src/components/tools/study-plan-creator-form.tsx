"use client";

import { useState } from 'react';
import { createStudyPlan } from '@/ai/flows/study-plan-creation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CalendarClock, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudyPlanCreatorForm() {
  const [subjects, setSubjects] = useState('');
  const [deadlines, setDeadlines] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjects.trim()) {
      setError("Please enter subjects to create a study plan.");
      return;
    }

    setIsLoading(true);
    setError("");
    setStudyPlan("");

    try {
      const result = await createStudyPlan({ subjects, deadlines });
      setStudyPlan(result.plan);
    } catch (e) {
      setError("An error occurred during plan creation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(studyPlan);
    toast({
      title: "Copied!",
      description: "The study plan has been copied to your clipboard.",
    });
  };

  const downloadPlan = () => {
    const blob = new Blob([studyPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Study Plan Creator</CardTitle>
        <CardDescription>Organize your study schedule by inputting subjects and deadlines.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subjects-text">Subjects / Topics</Label>
            <Textarea
              id="subjects-text"
              placeholder="e.g., Math, History, Biology final project, English essay..."
              rows={4}
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="deadlines-text">Deadlines / Timeframe (Optional)</Label>
            <Textarea
              id="deadlines-text"
              placeholder="e.g., Math exam in 2 weeks, Essay due Friday, 1 month for the project..."
              rows={3}
              value={deadlines}
              onChange={(e) => setDeadlines(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !subjects.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
            {isLoading ? 'Creating...' : 'Create Study Plan'}
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

      {studyPlan && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Your Study Plan</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadPlan} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={studyPlan} readOnly rows={15} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
