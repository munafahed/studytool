"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Presentation, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PresentationGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedSlides, setGeneratedSlides] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic for the presentation.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedSlides(null);

    // Simulate AI generation
    setTimeout(() => {
      const slides = Array.from({ length: slideCount }, (_, i) => 
        `Slide ${i + 1}: This is a sample slide about ${topic}. This slide would contain key points, images, and other relevant information.`
      );
      setGeneratedSlides(slides);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Presentation Generator</CardTitle>
          <CardDescription>Generate a presentation with a specified number of slides on any topic.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Presentation Topic</Label>
              <Textarea
                id="topic"
                placeholder="e.g., The Future of Renewable Energy"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slide-count">Number of Slides: {slideCount}</Label>
              <Slider
                id="slide-count"
                min={3}
                max={25}
                step={1}
                value={[slideCount]}
                onValueChange={(value) => setSlideCount(value[0])}
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !topic.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Presentation className="mr-2 h-4 w-4" />}
              {isLoading ? 'Generating...' : 'Generate Presentation'}
            </Button>
          </CardFooter>
        </form>
        {generatedSlides && (
          <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <h3 className="font-headline text-xl font-semibold mb-2">Generated Slides Outline</h3>
                <div className="p-4 rounded-md bg-secondary/50 space-y-2 max-h-80 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-2">
                        {generatedSlides.map((slide, index) => (
                            <li key={index}>{slide}</li>
                        ))}
                    </ul>
                </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
