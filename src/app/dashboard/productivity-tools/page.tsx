import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProductivityToolsPage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-headline font-bold text-primary">Productivity & Automation Tools</h1>
        <p className="text-muted-foreground mt-2">Streamline your workflow and stay on top of your tasks.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction. Check back later for new productivity and automation tools!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
