'use server';
/**
 * @fileOverview AI-powered citation generation flow.
 *
 * - generateCitation - A function that generates a citation from a URL.
 * - GenerateCitationInput - The input type for the generateCitation function.
 * - GenerateCitationOutput - The return type for the generateCitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCitationInputSchema = z.object({
  sourceUrl: z.string().describe('The URL of the source to be cited.'),
  citationStyle: z
    .string()
    .describe('The citation style to use (e.g., APA 7th, MLA 9th).'),
});
export type GenerateCitationInput = z.infer<typeof GenerateCitationInputSchema>;

const GenerateCitationOutputSchema = z.object({
  citation: z.string().describe('The generated citation.'),
});
export type GenerateCitationOutput = z.infer<typeof GenerateCitationOutputSchema>;

export async function generateCitation(
  input: GenerateCitationInput
): Promise<GenerateCitationOutput> {
  return generateCitationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCitationPrompt',
  input: {schema: GenerateCitationInputSchema},
  output: {schema: GenerateCitationOutputSchema},
  prompt: `You are an expert academic citation generator. Your task is to generate a citation for the given source URL in the specified style.

Source URL: {{{sourceUrl}}}
Citation Style: {{{citationStyle}}}

Please provide only the formatted citation as the output.`,
});

const generateCitationFlow = ai.defineFlow(
  {
    name: 'generateCitationFlow',
    inputSchema: GenerateCitationInputSchema,
    outputSchema: GenerateCitationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
