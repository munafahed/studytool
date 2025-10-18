'use server';

/**
 * @fileOverview Metadata and Schema Markup extractor for URLs
 * Extracts structured data from web pages for accurate citation generation
 */

export interface PageMetadata {
  // Basic metadata
  title?: string;
  description?: string;
  url: string;
  
  // Author information
  authors?: string[];
  authorByline?: string;
  
  // Publication details
  publishDate?: string;
  modifiedDate?: string;
  publisher?: string;
  siteName?: string;
  
  // Schema.org data
  schemaType?: string;
  schemaData?: Record<string, any>;
  
  // Open Graph data
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogPublishedTime?: string;
  ogModifiedTime?: string;
  ogAuthor?: string;
  
  // Twitter Card data
  twitterTitle?: string;
  twitterDescription?: string;
  twitterCreator?: string;
  
  // Additional metadata
  language?: string;
  keywords?: string[];
  
  // Confidence indicators
  metadataQuality: 'high' | 'medium' | 'low';
  extractedFields: string[];
}

/**
 * Fetches and extracts metadata from a URL
 */
export async function extractMetadata(url: string): Promise<PageMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CitationBot/1.0)',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return parseHTMLMetadata(html, url);
  } catch (error) {
    console.error('Error fetching URL:', error);
    // Return minimal metadata on error
    return {
      url,
      metadataQuality: 'low',
      extractedFields: [],
    };
  }
}

/**
 * Parses HTML content and extracts metadata
 */
function parseHTMLMetadata(html: string, url: string): PageMetadata {
  const metadata: PageMetadata = {
    url,
    metadataQuality: 'low',
    extractedFields: [],
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metadata.title = decodeHTMLEntities(titleMatch[1].trim());
    metadata.extractedFields.push('title');
  }

  // Extract meta tags
  const metaTagRegex = /<meta\s+([^>]*?)>/gi;
  let match;
  
  while ((match = metaTagRegex.exec(html)) !== null) {
    const metaTag = match[1];
    const nameMatch = metaTag.match(/(?:name|property)=["']([^"']+)["']/i);
    const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
    
    if (nameMatch && contentMatch) {
      const name = nameMatch[1].toLowerCase();
      const content = decodeHTMLEntities(contentMatch[1]);
      
      processMetaTag(metadata, name, content);
    }
  }

  // Extract JSON-LD Schema
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      processSchemaData(metadata, jsonData);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  // Extract author from bylines (common patterns)
  if (!metadata.authors || metadata.authors.length === 0) {
    extractAuthorsFromByline(html, metadata);
  }

  // Determine metadata quality
  metadata.metadataQuality = determineMetadataQuality(metadata);

  return metadata;
}

/**
 * Process individual meta tag
 */
function processMetaTag(metadata: PageMetadata, name: string, content: string) {
  // Open Graph
  if (name === 'og:title') {
    metadata.ogTitle = content;
    metadata.extractedFields.push('ogTitle');
  } else if (name === 'og:description') {
    metadata.ogDescription = content;
    metadata.extractedFields.push('ogDescription');
  } else if (name === 'og:type') {
    metadata.ogType = content;
    metadata.extractedFields.push('ogType');
  } else if (name === 'og:published_time' || name === 'article:published_time') {
    metadata.ogPublishedTime = content;
    metadata.publishDate = content;
    metadata.extractedFields.push('publishDate');
  } else if (name === 'og:modified_time' || name === 'article:modified_time') {
    metadata.ogModifiedTime = content;
    metadata.modifiedDate = content;
    metadata.extractedFields.push('modifiedDate');
  } else if (name === 'og:author' || name === 'article:author') {
    metadata.ogAuthor = content;
    if (!metadata.authors) metadata.authors = [];
    metadata.authors.push(content);
    metadata.extractedFields.push('authors');
  } else if (name === 'og:site_name') {
    metadata.siteName = content;
    metadata.extractedFields.push('siteName');
  }
  
  // Twitter Card
  else if (name === 'twitter:title') {
    metadata.twitterTitle = content;
  } else if (name === 'twitter:description') {
    metadata.twitterDescription = content;
  } else if (name === 'twitter:creator') {
    metadata.twitterCreator = content;
    if (!metadata.authors) metadata.authors = [];
    if (!metadata.authors.includes(content.replace('@', ''))) {
      metadata.authors.push(content.replace('@', ''));
      metadata.extractedFields.push('authors');
    }
  }
  
  // Standard meta tags
  else if (name === 'description') {
    metadata.description = content;
    metadata.extractedFields.push('description');
  } else if (name === 'author') {
    if (!metadata.authors) metadata.authors = [];
    // Split multiple authors by common separators
    const authors = content.split(/[,;&]/).map(a => a.trim()).filter(a => a);
    metadata.authors.push(...authors);
    metadata.extractedFields.push('authors');
  } else if (name === 'keywords') {
    metadata.keywords = content.split(',').map(k => k.trim());
    metadata.extractedFields.push('keywords');
  } else if (name === 'language' || name === 'content-language') {
    metadata.language = content;
    metadata.extractedFields.push('language');
  } else if (name === 'date' || name === 'pubdate' || name === 'publish-date') {
    metadata.publishDate = content;
    metadata.extractedFields.push('publishDate');
  } else if (name === 'last-modified' || name === 'revised') {
    metadata.modifiedDate = content;
    metadata.extractedFields.push('modifiedDate');
  } else if (name === 'publisher') {
    metadata.publisher = content;
    metadata.extractedFields.push('publisher');
  }
}

/**
 * Process Schema.org JSON-LD data
 */
function processSchemaData(metadata: PageMetadata, schemaData: any) {
  // Handle @graph array
  if (schemaData['@graph']) {
    schemaData['@graph'].forEach((item: any) => processSchemaData(metadata, item));
    return;
  }

  const type = schemaData['@type'];
  if (!type) return;

  // Store schema type
  if (!metadata.schemaType) {
    metadata.schemaType = Array.isArray(type) ? type[0] : type;
    metadata.schemaData = schemaData;
    metadata.extractedFields.push('schemaData');
  }

  // Extract relevant fields based on schema type
  if (type === 'Article' || type === 'NewsArticle' || type === 'ScholarlyArticle' || type === 'BlogPosting') {
    if (schemaData.headline && !metadata.title) {
      metadata.title = schemaData.headline;
      metadata.extractedFields.push('title');
    }
    
    if (schemaData.author) {
      if (!metadata.authors) metadata.authors = [];
      const authors = Array.isArray(schemaData.author) ? schemaData.author : [schemaData.author];
      authors.forEach((author: any) => {
        const name = typeof author === 'string' ? author : author.name;
        if (name && !metadata.authors!.includes(name)) {
          metadata.authors!.push(name);
        }
      });
      metadata.extractedFields.push('authors');
    }
    
    if (schemaData.datePublished && !metadata.publishDate) {
      metadata.publishDate = schemaData.datePublished;
      metadata.extractedFields.push('publishDate');
    }
    
    if (schemaData.dateModified && !metadata.modifiedDate) {
      metadata.modifiedDate = schemaData.dateModified;
      metadata.extractedFields.push('modifiedDate');
    }
    
    if (schemaData.publisher) {
      const publisher = typeof schemaData.publisher === 'string' 
        ? schemaData.publisher 
        : schemaData.publisher.name;
      if (publisher && !metadata.publisher) {
        metadata.publisher = publisher;
        metadata.extractedFields.push('publisher');
      }
    }
  }
  
  // Handle WebSite schema
  if (type === 'WebSite' && schemaData.name && !metadata.siteName) {
    metadata.siteName = schemaData.name;
    metadata.extractedFields.push('siteName');
  }
  
  // Handle Organization/Person schema
  if ((type === 'Organization' || type === 'Person') && schemaData.name && !metadata.publisher) {
    metadata.publisher = schemaData.name;
    metadata.extractedFields.push('publisher');
  }
}

/**
 * Extract authors from common byline patterns in HTML
 */
function extractAuthorsFromByline(html: string, metadata: PageMetadata) {
  // Common byline patterns
  const bylinePatterns = [
    /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/gi,
    /<a[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/a>/gi,
    /<div[^>]*class="[^"]*byline[^"]*"[^>]*>.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?<\/div>/gi,
  ];

  const authors = new Set<string>();
  
  bylinePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const author = match[1].trim();
      // Filter out common false positives
      if (author.length > 3 && author.length < 50 && !author.includes('<') && !author.includes('>')) {
        authors.add(author);
      }
    }
  });

  if (authors.size > 0) {
    metadata.authors = Array.from(authors);
    metadata.authorByline = Array.from(authors).join(', ');
    metadata.extractedFields.push('authors');
  }
}

/**
 * Determine metadata quality based on extracted fields
 */
function determineMetadataQuality(metadata: PageMetadata): 'high' | 'medium' | 'low' {
  const hasTitle = !!metadata.title;
  const hasAuthor = !!metadata.authors && metadata.authors.length > 0;
  const hasDate = !!metadata.publishDate;
  const hasPublisher = !!metadata.publisher || !!metadata.siteName;
  const hasSchema = !!metadata.schemaData;

  const score = [hasTitle, hasAuthor, hasDate, hasPublisher, hasSchema].filter(Boolean).length;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
  };

  return text.replace(/&[#a-z0-9]+;/gi, match => entities[match.toLowerCase()] || match);
}
