"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Star,
  FileText,
  BookOpen,
  Type,
  Globe,
  Briefcase,
  GraduationCap,
  FlaskConical,
  Paperclip,
  Lightbulb,
  Shield,
  Palette,
  Megaphone,
  Hash,
  MessageSquare,
  Quote,
  Zap,
  Languages,
  Combine,
  ScanSearch,
  Wand2,
  Share2,
  CalendarClock,
  Mic2,
  Radio,
  Presentation,
  Brush,
  FileOutput,
  AlarmClock,
  Clock,
  FileUp,
  Calculator,
  HelpCircle,
  FileJson2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const AiWriterToolCard = ({
  icon,
  title,
  description,
  isFavorite,
  href
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isFavorite: boolean;
  href: string;
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  return (
    <Link href={href} className="group block h-full">
        <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
            <div className="flex justify-between items-start">
                <Avatar className="mb-4 bg-secondary">
                    <AvatarFallback className="bg-transparent text-primary">{icon}</AvatarFallback>
                </Avatar>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault();
                        setFavorite(!favorite)
                    }}
                    className="w-8 h-8"
                >
                    <Star className={`w-5 h-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
            </div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>{description}</CardDescription>
        </CardContent>
        </Card>
    </Link>
  );
};


const categories = [
    "All", "Favorite", "Writing & Content", "Study Tools", "Productivity", 
];

const tools = [
    // Writing and Content
    { id: 'summarize', href: '/dashboard/summarize', icon: <FileText className="w-6 h-6" />, title: 'Summarize Text', description: 'Effortlessly condense large text into shorter summaries.', category: 'Writing & Content', isFavorite: true },
    { id: 'article', href: '/dashboard/essay-generator', icon: <BookOpen className="w-6 h-6" />, title: 'Article Generator', description: 'Instantly create unique articles on any topic.', category: 'Writing & Content', isFavorite: false },
    { id: 'multi-language-summary', href: '/dashboard/multi-language-summary', icon: <Languages className="w-6 h-6" />, title: 'Multi-language Summary', description: 'Summarize text from one language to another.', category: 'Writing & Content', isFavorite: false },
    { id: 'language-tools', href: '/dashboard/language-tools', icon: <Combine className="w-6 h-6" />, title: 'Unified Language Tools', description: 'Grammar check, rewrite, or translate text.', category: 'Writing & Content', isFavorite: false },
    { id: 'regenerate_text', href: '/dashboard/regenerate-text', icon: <Wand2 className="w-6 h-6" />, title: 'Regenerate Text', description: 'Rewrite text to sound more natural and human-like.', category: 'Writing & Content', isFavorite: true },
    { id: 'citation_generator', href: '/dashboard/citation-generator', icon: <Quote className="w-6 h-6" />, title: 'Citation Generator', description: 'Create citations in various styles like APA, MLA, and more.', category: 'Writing & Content', isFavorite: true },
    
    // Study Tools
    { id: 'ai_detector', href: '/dashboard/ai-detector', icon: <ScanSearch className="w-6 h-6" />, title: 'AI Detector', description: 'Analyze text to determine the probability of AI-generated content.', category: 'Study Tools', isFavorite: true },
    { id: 'question_generator', href: '/dashboard/question-generator', icon: <HelpCircle className="w-6 h-6" />, title: 'Question Generator', description: 'Generate insightful questions from any text or document.', category: 'Study Tools', isFavorite: false },
    { id: 'flashcard_generator', href: '/dashboard/flashcard-generator', icon: <Lightbulb className="w-6 h-6" />, title: 'Flashcard Generator', description: 'Create interactive flashcards from your notes for effective learning.', category: 'Study Tools', isFavorite: false },
    { id: 'mind_map', href: '/dashboard/mind-map-generator', icon: <Share2 className="w-6 h-6" />, title: 'Mind Map Generator', description: 'Visualize your ideas by generating an interactive mind map.', category: 'Study Tools', isFavorite: false },
    { id: 'gpa_calculator', href: '/dashboard/gpa-calculator', icon: <Calculator className="w-6 h-6" />, title: 'GPA Calculator', description: 'Calculate your Grade Point Average based on grades and credits.', category: 'Study Tools', isFavorite: true },
    { id: 'study_plan', href: '/dashboard/study-plan-creator', icon: <CalendarClock className="w-6 h-6" />, title: 'Study Plan Creator', description: 'Organize your study schedule by inputting subjects and deadlines.', category: 'Study Tools', isFavorite: false },

    // Video, Audio & Presentation
    { id: 'audio_summary', href: '/dashboard/audio-summary', icon: <FileUp className="w-6 h-6" />, title: 'Audio Summarization', description: 'Get a quick summary from any audio file you upload.', category: 'Productivity', isFavorite: false },
    { id: 'podcast_summary', href: '/dashboard/podcast-summarizer', icon: <Radio className="w-6 h-6" />, title: 'Podcast Summarizer', description: 'Summarize your favorite podcasts using a URL or file upload.', category: 'Productivity', isFavorite: false },
    { id: 'presentation_generator', href: '/dashboard/presentation-generator', icon: <Presentation className="w-6 h-6" />, title: 'Presentation Generator', description: 'Generate a presentation with a specified number of slides.', category: 'Productivity', isFavorite: false },
    { id: 'slide_designer', href: '/dashboard/slide-designer', icon: <Brush className="w-6 h-6" />, title: 'Slide Designer', description: 'Choose from various templates to design your presentation slides.', category: 'Productivity', isFavorite: false },
    { id: 'speech_to_text', href: '/dashboard/transcription', icon: <Mic2 className="w-6 h-6" />, title: 'Speech to Text', description: 'Upload an audio lecture and receive a full text transcript.', category: 'Productivity', isFavorite: false },

    // Productivity
    { id: 'text_to_pdf', href: '/dashboard/text-to-pdf', icon: <FileJson2 className="w-6 h-6" />, title: 'Text to PDF', description: 'Convert your text into a downloadable PDF document instantly.', category: 'Productivity', isFavorite: false },
    { id: 'export', href: '/dashboard/export', icon: <FileOutput className="w-6 h-6" />, title: 'Export Content', description: 'Export your content to PDF, TXT, or Markdown formats.', category: 'Productivity', isFavorite: false },
    { id: 'scheduler', href: '/dashboard/scheduler', icon: <AlarmClock className="w-6 h-6" />, title: 'Content Scheduler', description: 'Schedule your tasks and set reminders to stay on track.', category: 'Productivity', isFavorite: false },
    { id: 'timer', href: '/dashboard/timer', icon: <Clock className="w-6 h-6" />, title: 'Student Timer', description: 'Use a timer with various designs to focus on your studies.', category: 'Productivity', isFavorite: true },
];


export default function DocumentToolsPage() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredTools = tools.filter(tool => {
        if (activeCategory === "All") return true;
        if (activeCategory === "Favorite") return tool.isFavorite;
        return tool.category === activeCategory;
    });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
      <div className="mb-6">
        <Button variant="link" className="text-muted-foreground p-0 h-auto" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-2">AI Writer</h1>
        <p className="text-muted-foreground">Text Generator & AI Copywriting Assistant</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {categories.map((category) => (
            <Button 
                key={category} 
                variant={activeCategory === category ? 'secondary' : 'ghost'}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
            >
                {category}
            </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
            <AiWriterToolCard
                key={tool.id}
                href={tool.href}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                isFavorite={tool.isFavorite}
            />
        ))}
      </div>
    </div>
  );
}
