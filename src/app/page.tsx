import ToolCard from '@/components/tool-card';
import InteractiveBackground from '@/components/interactive-background';
import {
  FileText,
  FileJson2,
  BookText,
  Quote,
  Languages,
  HelpCircle,
  Share2,
  Lightbulb,
  Calculator,
  CalendarClock,
  Mic2,
  Radio,
  Presentation,
  Brush,
  Combine,
  FileOutput,
  AlarmClock,
  Clock,
  FileUp,
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  ScanSearch,
  Wand2,
  FileSpreadsheet,
} from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const tools = [
  {
    title: 'File Summarization',
    description: 'Upload a file and get a concise summary. Supports short, medium, and long formats.',
    href: '/dashboard/summarize',
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: 'Text to PDF',
    description: 'Convert your text into a downloadable PDF document instantly.',
    href: '/dashboard/text-to-pdf',
    icon: <FileJson2 className="h-6 w-6" />,
  },
  {
    title: 'Cover Page Generator',
    description: 'Create professional academic cover pages with logo upload and download as Word document.',
    href: '/dashboard/cover-page',
    icon: <FileSpreadsheet className="h-6 w-6" />,
  },
  {
    title: 'Essay / Report Generator',
    description: 'Generate a short or detailed essay/report from text or a file.',
    href: '/dashboard/essay-generator',
    icon: <BookText className="h-6 w-6" />,
  },
  {
    title: 'Citation Generator',
    description: 'Create citations in various styles like APA, MLA, and more.',
    href: '/dashboard/citation-generator',
    icon: <Quote className="h-6 w-6" />,
  },
  {
    title: 'Multi-language Summarization',
    description: 'Summarize text from one language to another effortlessly.',
    href: '/dashboard/multi-language-summary',
    icon: <Languages className="h-6 w-6" />,
  },
  {
    title: 'Question Generation',
    description: 'Generate insightful questions from any text or document.',
    href: '/dashboard/question-generator',
    icon: <HelpCircle className="h-6 w-6" />,
  },
  {
    title: 'Flashcard Generator',
    description: 'Create interactive flashcards from your notes for effective learning.',
    href: '/dashboard/flashcard-generator',
    icon: <Lightbulb className="h-6 w-6" />,
  },
   {
    title: 'AI Detector',
    description: 'Analyze text to determine the probability of AI-generated content.',
    href: '/dashboard/ai-detector',
    icon: <ScanSearch className="h-6 w-6" />,
  },
  {
    title: 'Regenerate Text',
    description: 'Rewrite text to sound more natural and human-like while preserving meaning.',
    href: '/dashboard/regenerate-text',
    icon: <Wand2 className="h-6 w-6" />,
  },
  {
    title: 'Mind Map Generator',
    description: 'Visualize your ideas by generating an interactive mind map.',
    href: '/dashboard/mind-map-generator',
    icon: <Share2 className="h-6 w-6" />,
  },
  {
    title: 'GPA Calculator',
    description: 'Calculate your Grade Point Average based on grades and credits.',
    href: '/dashboard/gpa-calculator',
    icon: <Calculator className="h-6 w-6" />,
  },
  {
    title: 'Study Plan Creator',
    description: 'Organize your study schedule by inputting subjects and deadlines.',
    href: '/dashboard/study-plan-creator',
    icon: <CalendarClock className="h-6 w-6" />,
  },
  {
    title: 'Audio to Text Converter (Full Transcription + Summary)',
    description: 'Convert audio files to complete text transcription or get a quick summary - Your choice!',
    href: '/dashboard/audio-to-text',
    icon: <Mic2 className="h-6 w-6" />,
  },
  {
    title: 'Podcast Summarizer',
    description: 'Summarize your favorite podcasts using a URL or file upload.',
    href: '/dashboard/podcast-summarizer',
    icon: <Radio className="h-6 w-6" />,
  },
  {
    title: 'Presentation Generator',
    description: 'Generate a presentation with a specified number of slides.',
    href: '/dashboard/presentation-generator',
    icon: <Presentation className="h-6 w-6" />,
  },
  {
    title: 'Slide Designer / Template Generator',
    description: 'Choose from various templates to design your presentation slides.',
    href: '/dashboard/slide-designer',
    icon: <Brush className="h-6 w-6" />,
  },
  {
    title: 'Unified Language Tools',
    description: 'Correct grammar, rewrite, or translate your text all in one place.',
    href: '/dashboard/language-tools',
    icon: <Combine className="h-6 w-6" />,
  },
  {
    title: 'Export to Multiple Formats',
    description: 'Export your content to PDF, Word, TXT, or Markdown formats.',
    href: '/dashboard/export',
    icon: <FileOutput className="h-6 w-6" />,
  },
  {
    title: 'Content Scheduler / Reminder',
    description: 'Schedule your tasks and set reminders to stay on track.',
    href: '/dashboard/scheduler',
    icon: <AlarmClock className="h-6 w-6" />,
  },
  {
    title: 'Student Timer / Countdown',
    description: 'Use a timer with various designs to focus on your studies.',
    href: '/dashboard/timer',
    icon: <Clock className="h-6 w-6" />,
  },
];

export default function Home() {
  const tokensUsed = 45;
  const totalTokens = 100;
  const tokenPercentage = (tokensUsed / totalTokens) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative h-[70vh] flex items-center justify-center text-center text-foreground bg-background">
            <InteractiveBackground />
            <div className="relative z-10 container">
                <h1 className="text-5xl md:text-7xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-white drop-shadow-lg">Welcome to StudyMune</h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-foreground/80">Your all-in-one platform for academic excellence. Let's make learning smarter, not harder.</p>
                <Button asChild size="lg" className="mt-8 rounded-full font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-transform transform hover:scale-105">
                    <Link href="#tools">
                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        <section id="tools" className="container py-16">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-4xl font-bold text-primary">Your Academic Toolkit</h2>
              <p className="text-muted-foreground mt-2">All the tools you need for success, in one place.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.title}
                  title={tool.title}
                  description={tool.description}
                  href={tool.href}
                  icon={tool.icon}
                />
              ))}
            </div>
        </section>

        <section id="plan" className="container py-16">
          <div className="mb-12 text-center">
              <h2 className="font-headline text-4xl font-bold text-primary">Plan & Usage</h2>
              <p className="text-muted-foreground mt-2">Manage your plan and track your token usage.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Premium</div>
                <p className="text-xs text-muted-foreground">
                  Unlimited access to all tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  Across all tools this month.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokensUsed} / {totalTokens}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  You&apos;ve used {tokenPercentage}% of your tokens.
                </p>
                <Progress value={tokenPercentage} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
