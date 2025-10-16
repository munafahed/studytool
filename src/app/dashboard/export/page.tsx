"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Download, FileOutput, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ExportFormat = "pdf" | "txt" | "md";

export default function ExportPage() {
  const [text, setText] = useState('This is some sample text to be exported. You can replace this with your own content from any of the other tools.');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter some text to export.',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
        try {
            switch (format) {
                case 'pdf':
                    exportAsPdf();
                    break;
                case 'txt':
                    exportAsTxt();
                    break;
                case 'md':
                    exportAsMd();
                    break;
            }
            toast({
                title: 'Success!',
                description: `Your file has been downloaded as a .${format}`,
            });
        } catch (error) {
            console.error('Failed to export file:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh!',
                description: 'Something went wrong while exporting the file.',
            });
        } finally {
            setIsLoading(false);
        }
    }, 500);
  };

  const exportAsPdf = () => {
    const doc = new jsPDF();
    const page_width = doc.internal.pageSize.getWidth();
    const margin = 15;
    const max_line_width = page_width - margin * 2;
    const lines = doc.splitTextToSize(text, max_line_width);
    doc.text(lines, margin, margin);
    doc.save('document.pdf');
  };

  const exportAsTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, 'document.txt');
  };

  const exportAsMd = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    downloadBlob(blob, 'document.md');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Export Content</CardTitle>
          <CardDescription>Export your content to various formats like PDF, TXT, or Markdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="content">Your Content</Label>
            <Textarea
              placeholder="Paste or type your content here."
              id="content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={15}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)} disabled={isLoading}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="txt">Text (.txt)</SelectItem>
                    <SelectItem value="md">Markdown (.md)</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDownload} disabled={isLoading || !text.trim()} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? `Exporting as ${format.toUpperCase()}...` : `Download as ${format.toUpperCase()}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
