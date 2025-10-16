"use client";

import { useState } from 'react';
import { generateMindMap } from '@/ai/flows/mind-map-generation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Share2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

const MindMapDisplay = ({ node, level = 0 }: { node: MindMapNode, level?: number }) => {
  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <p className="font-semibold">{level === 0 ? 'Main Topic:' : '•'} {node.title}</p>
      {node.children && (
        <ul className="pl-4 border-l-2 border-primary/20">
          {node.children.map((child, index) => (
            <li key={index}>
              <MindMapDisplay node={child} level={level + 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function MindMapGeneratorForm() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic to generate a mind map.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMindMap(null);

    try {
      const result = await generateMindMap({ topic });
      setMindMap(result.mindMap);
    } catch (e) {
      setError("An error occurred during generation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const mindMapToText = (node: MindMapNode, level = 0): string => {
    let text = `${'  '.repeat(level)}- ${node.title}\n`;
    if (node.children) {
      node.children.forEach(child => {
        text += mindMapToText(child, level + 1);
      });
    }
    return text;
  };
  
  const handleCopy = () => {
    if (mindMap) {
      navigator.clipboard.writeText(mindMapToText(mindMap));
      toast({
        title: "Copied!",
        description: "The mind map has been copied to your clipboard.",
      });
    }
  };
  
  const downloadMindMap = () => {
    if (mindMap) {
        const text = mindMapToText(mindMap);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind_map.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Mind Map Generator</CardTitle>
        <CardDescription>Visualize your ideas by generating an interactive mind map from a topic.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic-text">Your Topic</Label>
            <Textarea
              id="topic-text"
              placeholder="e.g., The benefits of renewable energy..."
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !topic.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating...' : 'Generate Mind Map'}
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

      {mindMap && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className='w-full'>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl font-semibold">Generated Mind Map</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button onClick={downloadMindMap} variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                        </Button>
                    </div>
                </div>
                <div className="p-4 rounded-md bg-secondary/50 space-y-2 max-h-96 overflow-y-auto">
                    <MindMapDisplay node={mindMap} />
                </div>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
