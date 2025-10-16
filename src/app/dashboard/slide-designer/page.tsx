"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Brush, Palette, Type, Image as ImageIcon } from 'lucide-react';

const templates = [
  { id: 'professional', name: 'Professional', description: 'Clean and modern design for corporate use.', colors: ['bg-blue-700', 'bg-gray-200', 'bg-gray-800'] },
  { id: 'creative', name: 'Creative', description: 'Vibrant and artistic for portfolio or creative projects.', colors: ['bg-purple-500', 'bg-yellow-300', 'bg-pink-400'] },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant, focusing on content.', colors: ['bg-gray-900', 'bg-white', 'bg-gray-400'] },
  { id: 'academic', name: 'Academic', description: 'Formal layout suitable for research and lectures.', colors: ['bg-red-800', 'bg-gray-100', 'bg-blue-900'] },
];

const TemplateCard = ({ template, onSelect, isSelected }: { template: typeof templates[0], onSelect: (id: string) => void, isSelected: boolean }) => (
    <Card 
        className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary' : 'hover:shadow-md'}`}
        onClick={() => onSelect(template.id)}
    >
        <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex space-x-2">
                {template.colors.map(color => (
                    <div key={color} className={`h-8 w-8 rounded-full ${color} border-2 border-white`}></div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function SlideDesignerPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Slide Designer / Template Generator</CardTitle>
                <CardDescription>Choose a template to start designing your presentation slides.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {templates.map(template => (
                <TemplateCard 
                    key={template.id} 
                    template={template}
                    onSelect={setSelectedTemplate}
                    isSelected={selectedTemplate === template.id}
                />
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Customization Options</CardTitle>
                <CardDescription>Further customize your selected template (coming soon).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                    <Palette className="h-8 w-8 text-primary"/>
                    <span className="text-sm font-medium">Color Scheme</span>
                </div>
                 <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                    <Type className="h-8 w-8 text-primary"/>
                    <span className="text-sm font-medium">Typography</span>
                </div>
                 <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                    <Brush className="h-8 w-8 text-primary"/>
                    <span className="text-sm font-medium">Layout Style</span>
                </div>
                 <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-primary"/>
                    <span className="text-sm font-medium">Background</span>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
