import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VideoAudioToolsPage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-headline font-bold text-primary">Video & Audio Tools</h1>
        <p className="text-muted-foreground mt-2">Transcribe and summarize your multimedia content.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction. Check back later for powerful video and audio tools!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
