"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageSquare,
  FlaskConical,
  Youtube,
  FileJson,
  Eye,
  PenSquare,
  ScanSearch,
  BookCopy,
  Wand2,
  ListTodo,
  Code,
  ImageIcon,
  Clapperboard,
  ChevronLeft,
  GraduationCap,
  Mic,
  Instagram,
  AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const userNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/documents", label: "Documents", icon: FileText },
];

const studyTools = [
  { href: "/dashboard/document-tools", label: "AI Study Tools", icon: BookOpen },
  { href: "/dashboard/cover-page", label: "Cover Page Generator", icon: FileText },
  { href: "#ai-teachers", label: "24/7 AI Teachers", icon: MessageSquare },
  { href: "#project-generator", label: "Project Topic Generator", icon: FlaskConical },
  { href: "#ai-youtube", label: "AI YouTube", icon: Youtube },
  { href: "#ai-file-chat", label: "AI File Chat", icon: FileJson },
  { href: "#ai-vision", label: "AI Vision", icon: Eye },
  { href: "#ai-editor", label: "AI Editor", icon: PenSquare },
  { href: "#ai-detector", label: "AI Detector", icon: ScanSearch },
  { href: "#ai-plagiarism", label: "AI Plagiarism", icon: BookCopy },
  { href: "#ai-article-wizard", label: "AI Article Wizard", icon: Wand2 },
  { href: "#seo-tool", label: "SEO Tool", icon: ListTodo },
  { href: "#ai-code", label: "AI Code", icon: Code },
];

const imageTools = [
    { href: "#ai-image", label: "AI Image", icon: ImageIcon },
    { href: "#ai-photo-studio", label: "AI Photo Studio", icon: Clapperboard },
    { href: "#ai-avatar-videos", label: "AI Avatar Videos", icon: Clapperboard }
];

const voiceTools = [
    { href: "#speech-to-text", label: "AI Speech to Text", icon: Mic },
    { href: "#voiceover", label: "AI Voiceover", icon: Mic }
];

const communityApps = [
    { href: "#android-app", label: "Android App", icon: AppWindow },
    { href: "#instagram", label: "Instagram", icon: Instagram }
];

const NavList = ({ title, items }: { title: string, items: {href: string, label: string, icon: React.ElementType}[] }) => {
    const pathname = usePathname();
    return (
        <div>
            <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h2>
            <ul className="space-y-1">
                {items.map((item) => (
                    <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === item.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
        <div className="h-16 border-b px-6 flex items-center justify-between">
            <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-primary mr-2"/>
                <h1 className="text-lg font-bold">Student AI</h1>
            </div>
            <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
            </Button>
        </div>
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        <NavList title="User" items={userNav} />
        <NavList title="Study Tools" items={studyTools} />
        <NavList title="Image and Studio Tools" items={imageTools} />
        <NavList title="AI Voice Tools" items={voiceTools} />
        <NavList title="Community & Apps" items={communityApps} />
      </nav>
    </aside>
  );
}
