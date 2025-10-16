'use server';

/**
 * @fileOverview A unified language tool that checks grammar, rewrites/paraphrases, or translates text.
 *
 * - unifiedLanguageTool - A function that handles the unified language processing.
 * - UnifiedLanguageToolInput - The input type for the unifiedLanguageTool function.
 * - UnifiedLanguageToolOutput - The return type for the unifiedLanguageTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UnifiedLanguageToolInputSchema = z.object({
  text: z.string().describe('The input text to be processed.'),
  grammarCheck: z.boolean().default(false).describe('Whether to check grammar and spelling.'),
  rewrite: z.boolean().default(false).describe('Whether to rewrite or paraphrase the text.'),
  translate: z.boolean().default(false).describe('Whether to translate the text.'),
  sourceLanguage: z.string().optional().describe('The source language for translation.'),
  targetLanguage: z.string().optional().describe('The target language for translation.'),
});
export type UnifiedLanguageToolInput = z.infer<typeof UnifiedLanguageToolInputSchema>;

const UnifiedLanguageToolOutputSchema = z.object({
  processedText: z.string().describe('The processed text after applying the selected operations.'),
});
export type UnifiedLanguageToolOutput = z.infer<typeof UnifiedLanguageToolOutputSchema>;

export async function unifiedLanguageTool(input: UnifiedLanguageToolInput): Promise<UnifiedLanguageToolOutput> {
  return unifiedLanguageToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'unifiedLanguageToolPrompt',
  input: {schema: UnifiedLanguageToolInputSchema},
  output: {schema: UnifiedLanguageToolOutputSchema},
  prompt: `You are a versatile language tool capable of grammar checking, rewriting, and translating text.

  Instructions:
  1. Grammar Check: If grammarCheck is true, correct any grammar and spelling errors in the input text.
  2. Rewriting: If rewrite is true, rewrite or paraphrase the input text to improve its clarity and flow.
  3. Translation: If translate is true, translate the input text from the sourceLanguage to the targetLanguage.

  Input Text: {{{text}}}

  Source Language: {{sourceLanguage}}
  Target Language: {{targetLanguage}}

  Here's the processed text:
  `,
});

const unifiedLanguageToolFlow = ai.defineFlow(
  {
    name: 'unifiedLanguageToolFlow',
    inputSchema: UnifiedLanguageToolInputSchema,
    outputSchema: UnifiedLanguageToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
