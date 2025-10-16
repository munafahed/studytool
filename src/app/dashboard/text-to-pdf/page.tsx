"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TextToPdfPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter some text to convert to PDF.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // We use a timeout to allow the UI to update to the loading state
      setTimeout(() => {
        const doc = new jsPDF();
        
        // jsPDF doesn't handle wrapping long lines automatically with the default `text` method.
        // We need to split the text into lines that fit the page width.
        const page_width = doc.internal.pageSize.getWidth();
        const margin = 15;
        const max_line_width = page_width - margin * 2;
        
        // The splitTextToSize function is perfect for this.
        const lines = doc.splitTextToSize(text, max_line_width);
        
        doc.text(lines, margin, margin);
        doc.save('document.pdf');
        
        toast({
          title: 'Success!',
          description: 'Your PDF has been downloaded.',
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Something went wrong while generating the PDF.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Text to PDF Converter</CardTitle>
          <CardDescription>Enter your text below and download it as a PDF document.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your text</Label>
            <Textarea
              placeholder="Type your message here."
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={15}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDownload} disabled={isLoading || !text.trim()} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating PDF...' : 'Download as PDF'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
