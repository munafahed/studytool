"use client";

import { useState } from 'react';
import { generateFlashcards } from '@/ai/flows/flashcard-generation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Copy, Lightbulb, RotateCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from '@/lib/utils';

interface Flashcard {
  front: string;
  back: string;
}

const FlashcardViewer = ({ flashcards }: { flashcards: Flashcard[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="space-y-4">
      <div className="perspective-1000">
        <motion.div
          key={currentIndex}
          className="relative w-full h-64 transform-style-preserve-3d"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={cn("absolute w-full h-full backface-hidden flex items-center justify-center p-6 rounded-lg border cursor-pointer transition-transform duration-500", isFlipped ? 'rotate-y-180' : 'rotate-y-0')}
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <p className="text-center text-lg">{flashcards[currentIndex].front}</p>
          </div>
          <div
            className={cn("absolute w-full h-full backface-hidden flex items-center justify-center p-6 rounded-lg border bg-secondary cursor-pointer transition-transform duration-500", isFlipped ? 'rotate-y-0' : '-rotate-y-180')}
            style={{ transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)' }}
          >
            <p className="text-center">{flashcards[currentIndex].back}</p>
          </div>
        </motion.div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={handlePrev} variant="outline">Previous</Button>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </div>
        <Button onClick={handleNext} variant="outline">Next</Button>
      </div>
    </div>
  );
};


export default function FlashcardGeneratorForm() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to generate flashcards from.");
      return;
    }

    setIsLoading(true);
    setError("");
    setFlashcards([]);

    try {
      const result = await generateFlashcards({ text });
      setFlashcards(result.flashcards);
    } catch (e) {
      setError("An error occurred during generation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (flashcards.length > 0) {
      const flashcardsText = flashcards.map(f => `Front: ${f.front}\nBack: ${f.back}`).join('\n\n');
      navigator.clipboard.writeText(flashcardsText);
      toast({
        title: "Copied!",
        description: "The flashcards have been copied to your clipboard.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Flashcard Generator</CardTitle>
        <CardDescription>Create interactive flashcards from your notes for effective learning.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Your Text</Label>
            <Textarea
              id="input-text"
              placeholder="Paste the text you want to turn into flashcards..."
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !text.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating...' : 'Generate Flashcards'}
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

      {flashcards.length > 0 && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-xl font-semibold">Generated Flashcards</h3>
                    <Button onClick={handleCopy} variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy All</span>
                    </Button>
                </div>
                <FlashcardViewer flashcards={flashcards} />
            </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Add these utility classes to globals.css if they don't exist
// .perspective-1000 { perspective: 1000px; }
// .transform-style-preserve-3d { transform-style: preserve-3d; }
// .backface-hidden { backface-visibility: hidden; }
// .rotate-y-180 { transform: rotateY(180deg); }
// .-rotate-y-180 { transform: rotateY(-180deg); }
// .rotate-y-0 { transform: rotateY(0deg); }
