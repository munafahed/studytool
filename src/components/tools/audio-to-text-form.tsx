"use client";

import { useState } from 'react';
import { transcribeAudio } from '@/ai/flows/speech-to-text';
import { summarizeFile } from '@/ai/flows/file-summarization';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, File as FileIcon, Download, Loader2, AlertCircle, Copy, Mic2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from '../ui/input';

type OutputMode = 'full' | 'summary';

export default function AudioToTextForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>('full');
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/') && !selectedFile.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
        setError("الرجاء رفع ملف صوتي صحيح (MP3, WAV, M4A, OGG, WebM)");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setResult("");
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
      setError("الرجاء اختيار ملف صوتي للمعالجة");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const audioDataUri = await fileToDataUri(file);
      
      if (outputMode === 'full') {
        // نسخ كامل للصوت
        const transcriptResult = await transcribeAudio({ audioDataUri });
        setResult(transcriptResult.transcript);
      } else {
        // تلخيص الصوت
        const summaryResult = await summarizeFile({
          fileName: file.name,
          fileDataUri: audioDataUri,
          length: 'medium',
        });
        setResult(summaryResult.summary);
      }
    } catch (e) {
      setError("حدث خطأ أثناء معالجة الملف الصوتي. الرجاء المحاولة مرة أخرى.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "تم النسخ!",
      description: "تم نسخ النص إلى الحافظة بنجاح.",
    });
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = outputMode === 'full' 
      ? `نسخ_صوتي_${file?.name || 'audio'}.txt`
      : `ملخص_صوتي_${file?.name || 'audio'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic2 className="h-6 w-6 text-primary" />
          تحويل الصوت إلى نص كامل أو ملخص
        </CardTitle>
        <CardDescription>
          ارفع ملف صوتي واحصل على نسخ نصي كامل أو ملخص مختصر للمحتوى
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="audio-file">الملف الصوتي</Label>
            <div className="flex items-center gap-2">
              <Input
                id="audio-file"
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileIcon className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Output Mode Selection */}
          <div className="space-y-3">
            <Label>نوع المخرجات</Label>
            <RadioGroup
              value={outputMode}
              onValueChange={(value) => setOutputMode(value as OutputMode)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="full" id="mode-full" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="mode-full"
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    نص كامل (نسخ كامل للصوت)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    تحويل كامل الملف الصوتي إلى نص مكتوب بالتفصيل
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="summary" id="mode-summary" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="mode-summary"
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    ملخص مختصر
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    الحصول على ملخص سريع للنقاط الرئيسية من الملف الصوتي
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {outputMode === 'full' ? 'تحويل إلى نص كامل' : 'إنشاء ملخص'}
              </>
            )}
          </Button>
        </CardContent>
      </form>

      {/* Results Display */}
      {result && (
        <CardFooter className="flex-col items-start gap-4">
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {outputMode === 'full' ? 'النص الكامل' : 'الملخص'}
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">نسخ</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadResult}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">تحميل</span>
                </Button>
              </div>
            </div>
            <Textarea
              value={result}
              readOnly
              rows={15}
              className="bg-secondary/50 font-arabic"
              dir="auto"
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
