"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Copy, BookCheck, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateCitation } from '@/ai/flows/citation-generator';
import type { PageMetadata } from '@/lib/metadata-extractor';

const citationStyles = ["APA 7th", "MLA 9th", "Chicago 17th", "Harvard"];

export default function CitationGeneratorPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [citationStyle, setCitationStyle] = useState(citationStyles[0]);
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [metadataQuality, setMetadataQuality] = useState<'high' | 'medium' | 'low' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl.trim()) {
      setError('Please enter a source URL.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedCitation('');
    setMetadata(null);
    setMetadataQuality(null);

    try {
        const result = await generateCitation({
            sourceUrl,
            citationStyle,
        });
        setGeneratedCitation(result.citation);
        setMetadata(result.metadata || null);
        setMetadataQuality(result.metadataQuality || null);
        setShowMetadata(true);
    } catch (e) {
        console.error(e);
        setError('Failed to generate citation. Please check the URL and try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCitation) {
      navigator.clipboard.writeText(generatedCitation);
      toast({
        title: "Copied!",
        description: "Citation copied to clipboard.",
      });
    }
  };

  const getQualityBadge = () => {
    if (!metadataQuality) return null;
    
    const configs = {
      high: { label: 'High Quality', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-500' },
      medium: { label: 'Medium Quality', variant: 'secondary' as const, icon: Info, color: 'text-yellow-500' },
      low: { label: 'Low Quality', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-500' }
    };
    
    const config = configs[metadataQuality];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Advanced Citation Generator</CardTitle>
          <CardDescription>
            Generate accurate citations with automatic metadata extraction from Schema Markup, Open Graph, and HTML meta tags.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="source-url">Source URL</Label>
              <Input
                id="source-url"
                placeholder="https://example.com/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citation-style">Citation Style</Label>
              <Select value={citationStyle} onValueChange={setCitationStyle} disabled={isLoading}>
                <SelectTrigger id="citation-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {citationStyles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !sourceUrl.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCheck className="mr-2 h-4 w-4" />}
              {isLoading ? 'Extracting Metadata & Generating...' : 'Generate Citation'}
            </Button>
          </CardContent>
        </form>
        
        {generatedCitation && (
          <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            {/* Metadata Quality Indicator */}
            {metadataQuality && (
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Metadata Quality:</span>
                  {getQualityBadge()}
                </div>
                {metadata && metadata.extractedFields.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {metadata.extractedFields.length} fields extracted
                  </span>
                )}
              </div>
            )}

            {/* Generated Citation */}
            <div className='w-full'>
                <h3 className="font-headline text-xl font-semibold mb-2">Generated Citation</h3>
                <div className="relative">
                    <Textarea value={generatedCitation} readOnly rows={4} className="bg-secondary/50 pr-12"/>
                    <Button onClick={handleCopy} variant="ghost" size="icon" className="absolute top-2 right-2">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </div>

            {/* Extracted Metadata Details */}
            {metadata && (
              <Collapsible open={showMetadata} onOpenChange={setShowMetadata} className="w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {showMetadata ? 'Hide' : 'Show'} Extracted Metadata Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-3">
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-2 text-sm">
                    {metadata.title && (
                      <div>
                        <span className="font-semibold">Title:</span> {metadata.title}
                      </div>
                    )}
                    {metadata.authors && metadata.authors.length > 0 && (
                      <div>
                        <span className="font-semibold">Author(s):</span> {metadata.authors.join(', ')}
                      </div>
                    )}
                    {metadata.publishDate && (
                      <div>
                        <span className="font-semibold">Publication Date:</span> {metadata.publishDate}
                      </div>
                    )}
                    {metadata.modifiedDate && (
                      <div>
                        <span className="font-semibold">Last Modified:</span> {metadata.modifiedDate}
                      </div>
                    )}
                    {metadata.publisher && (
                      <div>
                        <span className="font-semibold">Publisher:</span> {metadata.publisher}
                      </div>
                    )}
                    {metadata.siteName && (
                      <div>
                        <span className="font-semibold">Site Name:</span> {metadata.siteName}
                      </div>
                    )}
                    {metadata.schemaType && (
                      <div>
                        <span className="font-semibold">Content Type (Schema.org):</span> {metadata.schemaType}
                      </div>
                    )}
                    {metadata.ogType && (
                      <div>
                        <span className="font-semibold">Open Graph Type:</span> {metadata.ogType}
                      </div>
                    )}
                    {metadata.description && (
                      <div>
                        <span className="font-semibold">Description:</span> {metadata.description.substring(0, 200)}...
                      </div>
                    )}
                    <div className="pt-2 border-t border-border">
                      <span className="font-semibold">Data Sources:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {metadata.extractedFields.map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {metadataQuality === 'medium' || metadataQuality === 'low' ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        Some metadata fields were not available from the source. The citation was generated using the available information.
                        {metadataQuality === 'low' && ' You may want to manually verify and complete the citation.'}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
