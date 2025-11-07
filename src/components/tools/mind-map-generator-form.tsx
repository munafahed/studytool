"use client";

import { useState } from 'react';
import { generateMindMap } from '@/ai/flows/mind-map-generation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Share2, Layers, Network } from "lucide-react";
import VisualMindMap from './visual-mind-map';

interface MindMapNode {
  title: string;
  description?: string;
  children?: MindMapNode[];
  color?: string;
}

const templates = [
  {
    value: 'hierarchical',
    label: 'Hierarchical',
    description: 'Top-down tree structure - perfect for classifications and processes',
    icon: Layers
  },
  {
    value: 'radial',
    label: 'Radial',
    description: 'Central topic with radiating branches - ideal for brainstorming',
    icon: Share2
  },
  {
    value: 'organizational',
    label: 'Organizational Chart',
    description: 'Organization structure style - great for hierarchies',
    icon: Network
  },
  {
    value: 'flowchart',
    label: 'Flowchart',
    description: 'Sequential flow - perfect for processes and workflows',
    icon: Share2
  },
];

const depths = [
  { value: 'shallow', label: '⚡ Quick (2 levels)', description: 'Fast generation - main branches only' },
  { value: 'medium', label: '📊 Balanced (3 levels)', description: 'Good detail in ~5-10 seconds' },
  { value: 'deep', label: '🔍 Detailed (4+ levels)', description: 'Comprehensive - takes 10-15 seconds' },
];

export default function MindMapGeneratorForm() {
  const [topic, setTopic] = useState('');
  const [template, setTemplate] = useState('hierarchical');
  const [depth, setDepth] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [error, setError] = useState("");

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
      const result = await generateMindMap({ 
        topic,
        template: template as 'hierarchical' | 'radial' | 'organizational' | 'flowchart',
        depth: depth as 'shallow' | 'medium' | 'deep'
      });
      setMindMap(result.mindMap);
    } catch (e) {
      setError("An error occurred during generation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.value === template);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Mind Map Generator</CardTitle>
          <CardDescription>Create beautiful, interactive mind maps with customizable templates</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic-text">Your Topic</Label>
              <Textarea
                id="topic-text"
                placeholder="e.g., Computer Network Types, Benefits of Renewable Energy, etc..."
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template">Mind Map Template</Label>
                <Select value={template} onValueChange={setTemplate} disabled={isLoading}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth">Detail Level</Label>
                <Select value={depth} onValueChange={setDepth} disabled={isLoading}>
                  <SelectTrigger id="depth">
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    {depths.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {depths.find(d => d.value === depth)?.description}
                </p>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !topic.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
              {isLoading ? 'Generating Mind Map...' : 'Generate Mind Map'}
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
      </Card>

      {mindMap && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Your Mind Map</CardTitle>
            <CardDescription>Interactive visualization - drag to move, scroll to zoom, export in multiple formats</CardDescription>
          </CardHeader>
          <CardContent>
            <VisualMindMap data={mindMap} template={template} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
