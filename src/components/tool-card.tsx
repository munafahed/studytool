import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

export default function ToolCard({ title, description, href, icon }: ToolCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <CardHeader className="flex-row items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-md text-primary">
                {icon}
            </div>
            <div className="flex-1">
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
