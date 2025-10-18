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
        title: 'خطأ',
        description: 'الرجاء إدخال نص لتحويله إلى PDF.',
      });
      return;
    }

    setIsLoading(true);
    try {
      setTimeout(() => {
        const doc = new jsPDF();
        
        // Page dimensions and margins
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        
        // Font settings for better readability
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const lineHeight = 7;
        
        // Split text into lines that fit the page width
        const lines = doc.splitTextToSize(text, maxLineWidth);
        
        // Calculate how many lines fit on one page
        const maxLinesPerPage = Math.floor((pageHeight - (margin * 2)) / lineHeight);
        
        let currentY = margin;
        let currentPage = 1;
        
        // Add lines to PDF with automatic page breaks
        lines.forEach((line: string, index: number) => {
          // Check if we need a new page
          if (index > 0 && index % maxLinesPerPage === 0) {
            doc.addPage();
            currentPage++;
            currentY = margin;
          }
          
          // Add the line to the current page
          doc.text(line, margin, currentY);
          currentY += lineHeight;
        });
        
        // Add page numbers at the bottom
        const totalPages = currentPage;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
        
        doc.save('document.pdf');
        
        toast({
          title: 'تم بنجاح! ✓',
          description: `تم إنشاء PDF من ${totalPages} صفحة وتنزيله.`,
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ!',
        description: 'حدث خطأ أثناء إنشاء ملف PDF.',
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
