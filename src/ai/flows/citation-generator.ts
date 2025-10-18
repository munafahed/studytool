'use server';
/**
 * @fileOverview Advanced AI-powered citation generation flow with metadata extraction.
 *
 * - generateCitation - A function that generates a citation from a URL with metadata extraction.
 * - GenerateCitationInput - The input type for the generateCitation function.
 * - GenerateCitationOutput - The return type for the generateCitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {extractMetadata, type PageMetadata} from '@/lib/metadata-extractor';

const GenerateCitationInputSchema = z.object({
  sourceUrl: z.string().describe('The URL of the source to be cited.'),
  citationStyle: z
    .string()
    .describe('The citation style to use (e.g., APA 7th, MLA 9th).'),
});
export type GenerateCitationInput = z.infer<typeof GenerateCitationInputSchema>;

const GenerateCitationOutputSchema = z.object({
  citation: z.string().describe('The generated citation.'),
  metadata: z.any().optional().describe('The extracted metadata from the source URL.'),
  metadataQuality: z.enum(['high', 'medium', 'low']).optional().describe('Quality of extracted metadata'),
});
export type GenerateCitationOutput = z.infer<typeof GenerateCitationOutputSchema>;

export async function generateCitation(
  input: GenerateCitationInput
): Promise<GenerateCitationOutput> {
  // First, extract metadata from the URL
  const metadata = await extractMetadata(input.sourceUrl);
  
  // Then generate citation using the extracted metadata
  const result = await generateCitationFlow({
    ...input,
    metadata,
  });
  
  return {
    ...result,
    metadata,
    metadataQuality: metadata.metadataQuality,
  };
}

const EnhancedGenerateCitationInputSchema = GenerateCitationInputSchema.extend({
  metadata: z.any().describe('Extracted metadata from the source URL'),
});

const prompt = ai.definePrompt({
  name: 'generateCitationPrompt',
  input: {schema: EnhancedGenerateCitationInputSchema},
  output: {schema: GenerateCitationOutputSchema},
  prompt: `You are an expert academic citation generator with deep knowledge of citation styles and bibliographic standards.

Your task is to generate an accurate, properly formatted citation for the given source URL using the specified citation style.

**Source URL:** {{{sourceUrl}}}
**Citation Style:** {{{citationStyle}}}

**EXTRACTED METADATA (Use this for accurate citation):**
{{#if metadata.title}}
- Title: {{{metadata.title}}}
{{/if}}
{{#if metadata.authors}}
- Author(s): {{{metadata.authors}}}
{{/if}}
{{#if metadata.publishDate}}
- Publication Date: {{{metadata.publishDate}}}
{{/if}}
{{#if metadata.modifiedDate}}
- Last Modified: {{{metadata.modifiedDate}}}
{{/if}}
{{#if metadata.publisher}}
- Publisher: {{{metadata.publisher}}}
{{/if}}
{{#if metadata.siteName}}
- Website/Publication Name: {{{metadata.siteName}}}
{{/if}}
{{#if metadata.description}}
- Description: {{{metadata.description}}}
{{/if}}
{{#if metadata.schemaType}}
- Content Type (Schema.org): {{{metadata.schemaType}}}
{{/if}}
{{#if metadata.ogType}}
- Open Graph Type: {{{metadata.ogType}}}
{{/if}}

**METADATA QUALITY:** {{{metadata.metadataQuality}}}
**EXTRACTED FIELDS:** {{{metadata.extractedFields}}}

**IMPORTANT INSTRUCTIONS:**

1. **Prioritize extracted metadata:** Use the metadata provided above as the primary source of information.

2. **Citation Style Guidelines:**
   - For **APA 7th Edition**: Follow APA 7th edition format precisely
     * Author, A. A. (Year, Month Day). Title of page. Site Name. URL
     * If no author: Use site name or title
     * If no date: Use (n.d.)
   
   - For **MLA 9th Edition**: Follow MLA 9th edition format precisely
     * Author Last Name, First Name. "Title of Page." Site Name, Day Month Year, URL.
     * If no author: Start with title
     * If no date: Omit date
   
   - For **Chicago 17th Edition**: Follow Chicago 17th edition format precisely
     * Author Last Name, First Name. "Title of Page." Site Name. Month Day, Year. URL.
   
   - For **Harvard**: Follow Harvard referencing format precisely
     * Author(s) Surname, Initials., Year. Title of page. [Online] Site Name. Available at: URL [Accessed Date].

3. **Handling Missing Information:**
   - If author is missing but site name exists, use site name as author (APA style)
   - If date is missing, use "n.d." for APA, omit for MLA
   - Always include the URL at the end
   - Use the most complete information available from metadata

4. **Formatting Rules:**
   - Follow exact capitalization, italicization, and punctuation rules for the style
   - Format dates according to the citation style requirements
   - Ensure proper ordering of elements
   - Include retrieval dates only if required by the style

5. **Quality Considerations:**
   - High quality metadata = high confidence citation
   - Medium/Low quality = still generate citation but use available data
   - Never invent information - only use what's provided

**OUTPUT:** Provide ONLY the formatted citation as plain text. Do not include explanations or metadata quality notes.`,
});

const generateCitationFlow = ai.defineFlow(
  {
    name: 'generateCitationFlow',
    inputSchema: EnhancedGenerateCitationInputSchema,
    outputSchema: GenerateCitationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
