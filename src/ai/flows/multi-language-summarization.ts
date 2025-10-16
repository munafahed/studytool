'use server';

/**
 * @fileOverview A multi-language summarization AI agent.
 *
 * - multiLanguageSummarization - A function that handles the summarization process.
 * - MultiLanguageSummarizationInput - The input type for the multiLanguageSummarization function.
 * - MultiLanguageSummarizationOutput - The return type for the multiLanguageSummarization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultiLanguageSummarizationInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
  sourceLanguage: z.string().describe('The language of the input text.'),
  summaryLanguage: z.string().describe('The language to summarize the text into.'),
});
export type MultiLanguageSummarizationInput = z.infer<
  typeof MultiLanguageSummarizationInputSchema
>;

const MultiLanguageSummarizationOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
});
export type MultiLanguageSummarizationOutput = z.infer<
  typeof MultiLanguageSummarizationOutputSchema
>;

export async function multiLanguageSummarization(
  input: MultiLanguageSummarizationInput
): Promise<MultiLanguageSummarizationOutput> {
  return multiLanguageSummarizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multiLanguageSummarizationPrompt',
  input: {schema: MultiLanguageSummarizationInputSchema},
  output: {schema: MultiLanguageSummarizationOutputSchema},
  prompt: `You are an expert summarizer that can summarize text in different languages.

  Summarize the following text, which is in {{sourceLanguage}}, into {{summaryLanguage}}.

  Text: {{{text}}}`,
});

const multiLanguageSummarizationFlow = ai.defineFlow(
  {
    name: 'multiLanguageSummarizationFlow',
    inputSchema: MultiLanguageSummarizationInputSchema,
    outputSchema: MultiLanguageSummarizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
