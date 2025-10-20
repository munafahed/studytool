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
  prompt: `You are a professional language tool specialized in improving text quality.

**Input Text:**
{{{text}}}

**Operations to Perform:**
{{#if grammarCheck}}
- ✓ Grammar & Spelling Check: Fix all grammar mistakes, spelling errors, and punctuation issues.
{{/if}}
{{#if rewrite}}
- ✓ Rewrite/Paraphrase: Rewrite the text to make it clearer, more professional, and better structured while keeping the same meaning and information. Make it sound more natural and polished.
{{/if}}
{{#if translate}}
- ✓ Translation: Translate from {{#if sourceLanguage}}{{sourceLanguage}}{{else}}auto-detected language{{/if}} to {{targetLanguage}}.
{{/if}}

**Important Instructions:**
1. Keep all the original information and meaning intact
2. If rewriting, improve sentence structure, word choice, and flow
3. Make the text more engaging and professional
4. If both grammar check and rewrite are selected, fix grammar first, then improve the writing style
5. Maintain the original tone and intent
6. Return ONLY the processed text, without any explanations or comments

**Processed Text:**`,
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
