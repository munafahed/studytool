"use client";

import { useState, ChangeEvent } from 'react';
import { generateQuestions } from '@/ai/flows/question-generation';
import { extractTextFromFile } from '@/lib/file-text-extractor';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, Copy, HelpCircle, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuestionGeneratorForm() {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState<string>('mixed');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsLoading(true);
      
      try {
        toast({
          title: "جاري قراءة الملف...",
          description: "الرجاء الانتظار، يتم استخراج النص من الملف.",
        });

        const fileText = await extractTextFromFile(selectedFile);
        setText(fileText);
        
        const wordCount = fileText.split(/\s+/).filter(word => word.length > 0).length;
        const suggestedQuestions = Math.max(3, Math.min(20, Math.floor(wordCount / 100)));
        setNumQuestions(suggestedQuestions);
        
        toast({
          title: "تم رفع الملف بنجاح! ✓",
          description: `تم استخراج النص من الملف. نقترح ${suggestedQuestions} أسئلة بناءً على حجم الملف (${wordCount} كلمة).`,
        });
      } catch (error) {
        console.error('Error reading file:', error);
        const errorMessage = error instanceof Error ? error.message : "تأكد من أن الملف بصيغة مدعومة.";
        toast({
          title: "خطأ في قراءة الملف",
          description: errorMessage,
          variant: "destructive"
        });
        setFile(null);
        setText('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("الرجاء إدخال نص أو رفع ملف لتوليد الأسئلة.");
      return;
    }

    setIsLoading(true);
    setError("");
    setQuestions([]);

    try {
      const result = await generateQuestions({ 
        text,
        questionType: questionType as any,
        numQuestions 
      });
      setQuestions(result.questions);
      toast({
        title: "تم التوليد بنجاح!",
        description: `تم توليد ${result.questions.length} سؤال.`,
      });
    } catch (e) {
      setError("حدث خطأ أثناء توليد الأسئلة. الرجاء المحاولة مرة أخرى.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (questions.length > 0) {
      const questionsText = questions.join('\n\n');
      navigator.clipboard.writeText(questionsText);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ الأسئلة إلى الحافظة.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Question Generator</CardTitle>
        <CardDescription>Upload files or paste text to generate insightful questions.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Input Mode</Label>
            <RadioGroup value={inputMode} onValueChange={(value) => {
              setInputMode(value as 'text' | 'file');
              setText('');
              setFile(null);
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="mode-text" />
                <Label htmlFor="mode-text" className="cursor-pointer font-normal">Write or Paste Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="mode-file" />
                <Label htmlFor="mode-file" className="cursor-pointer font-normal">Upload File</Label>
              </div>
            </RadioGroup>
          </div>

          {inputMode === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.md,.docx,.pdf,image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="input-text">Your Text</Label>
              <Textarea
                id="input-text"
                placeholder="Paste the text you want to generate questions from..."
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger id="question-type">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed (All Types)</SelectItem>
                  <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-questions">Number of Questions</Label>
              <Input
                id="num-questions"
                type="number"
                min="1"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating Questions...' : 'Generate Questions'}
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

      {questions.length > 0 && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Generated Questions ({questions.length})</h3>
                    <Button onClick={handleCopy} variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
                <div className="p-4 rounded-md bg-secondary/50 space-y-3">
                  {questions.map((q, index) => (
                    <div key={index} className="p-3 bg-background rounded-md border">
                      <p className="font-medium">
                        <span className="text-primary mr-2">Q{index + 1}:</span>
                        {q}
                      </p>
                    </div>
                  ))}
                </div>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
