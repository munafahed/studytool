"use client";

import { useState, ChangeEvent } from 'react';
import { generateQuestions } from '@/ai/flows/question-generation';
import type { GenerateQuestionsOutput } from '@/ai/flows/question-generation';
import { extractTextFromFile } from '@/lib/file-text-extractor';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, Copy, HelpCircle, FileText, Upload, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QuestionItem = {
  question: string;
  options?: string[];
  answer: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
};

export default function QuestionGeneratorForm() {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState<string>('mixed');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());
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
    setVisibleAnswers(new Set());

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

  const toggleAnswer = (index: number) => {
    setVisibleAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAllAnswers = () => {
    if (visibleAnswers.size === questions.length) {
      setVisibleAnswers(new Set());
    } else {
      setVisibleAnswers(new Set(questions.map((_, i) => i)));
    }
  };

  const handleCopy = () => {
    if (questions.length > 0) {
      const questionsText = questions.map((q, i) => {
        let text = `Q${i + 1}: ${q.question}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, idx) => {
            const label = q.type === 'mcq' ? String.fromCharCode(65 + idx) : '';
            text += `${label ? label + '. ' : ''}${opt}\n`;
          });
        }
        text += `Answer: ${q.answer}`;
        return text;
      }).join('\n\n');
      navigator.clipboard.writeText(questionsText);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ الأسئلة والإجابات إلى الحافظة.",
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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-xl font-semibold">Generated Questions ({questions.length})</h3>
                    <div className="flex gap-2">
                      <Button onClick={toggleAllAnswers} variant="outline" size="sm">
                        {visibleAnswers.size === questions.length ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide All Answers
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show All Answers
                          </>
                        )}
                      </Button>
                      <Button onClick={handleCopy} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                </div>
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={index} className="p-4 bg-background rounded-lg border-2 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <p className="font-semibold text-lg flex-1">
                          <span className="text-primary mr-2">Q{index + 1}.</span>
                          {q.question}
                        </p>
                        <Button 
                          onClick={() => toggleAnswer(index)} 
                          variant={visibleAnswers.has(index) ? "default" : "outline"}
                          size="sm"
                          className="shrink-0"
                        >
                          {visibleAnswers.has(index) ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div className={`mb-3 ${q.type === 'mcq' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'flex gap-3'}`}>
                          {q.options.map((option, optIdx) => {
                            const label = q.type === 'mcq' ? String.fromCharCode(65 + optIdx) : '';
                            const isCorrect = visibleAnswers.has(index) && (
                              (q.type === 'mcq' && q.answer === label) || 
                              (q.type === 'true_false' && q.answer === option)
                            );
                            
                            return (
                              <div 
                                key={optIdx} 
                                className={`p-2 rounded-md border ${
                                  isCorrect 
                                    ? 'bg-green-50 border-green-500 dark:bg-green-950/30 dark:border-green-700' 
                                    : 'bg-secondary/30'
                                }`}
                              >
                                {label && <span className="font-bold mr-2">{label}.</span>}
                                <span>{option}</span>
                                {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {visibleAnswers.has(index) && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded">
                          <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Answer:</p>
                          <p className="text-green-900 dark:text-green-100">
                            {q.type === 'mcq' && q.options ? (
                              <>
                                <span className="font-bold">{q.answer}</span>
                                {' - '}
                                {q.options[q.answer.charCodeAt(0) - 65] || q.answer}
                              </>
                            ) : (
                              q.answer
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
