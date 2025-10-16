"use client";

import { useState } from 'react';
import { transcribeAudio } from '@/ai/flows/speech-to-text';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File as FileIcon, Download, Loader2, AlertCircle, Copy, Mic2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from '../ui/input';

export default function SpeechToTextForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
        setError("Please upload a valid audio file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setTranscript("");
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
      setError("Please select an audio file to transcribe.");
      return;
    }

    setIsLoading(true);
    setError("");
    setTranscript("");

    try {
      const audioDataUri = await fileToDataUri(file);
      const result = await transcribeAudio({ audioDataUri });
      setTranscript(result.transcript);
    } catch (e) {
      setError("An error occurred during transcription. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast({
      title: "Copied!",
      description: "The transcript has been copied to your clipboard.",
    });
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileNameWithoutExt = file?.name.split('.').slice(0, -1).join('.') || 'transcript';
    a.download = `${fileNameWithoutExt}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Speech to Text</CardTitle>
        <CardDescription>Upload an audio lecture and receive a full text transcript.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Audio File</Label>
            <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
                accept="audio/*"
            />
            {file && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                <FileIcon className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic2 className="mr-2 h-4 w-4"/>}
            {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
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

      {transcript && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
          <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Your Transcript</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadTranscript} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <Textarea value={transcript} readOnly rows={15} className="bg-secondary/50"/>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
