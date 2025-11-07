'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpellCheckInputSchema = z.object({
  text: z.string().describe('The text to spell check and correct'),
  language: z.enum(['ar', 'en']).describe('The language of the text'),
});

const SpellCheckOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text'),
});

export type SpellCheckInput = z.infer<typeof SpellCheckInputSchema>;
export type SpellCheckOutput = z.infer<typeof SpellCheckOutputSchema>;

const prompt = ai.definePrompt({
  name: 'spellCheckPrompt',
  input: { schema: SpellCheckInputSchema },
  output: { schema: SpellCheckOutputSchema },
  prompt: `You are an expert spelling and grammar corrector.

Your task is to correct spelling errors, grammar mistakes, and apply proper capitalization in the given text.

**Language:** {{{language}}}
**Text:** {{{text}}}

{{#if (eq language "ar")}}
صحح الأخطاء الإملائية والنحوية في النص أعلاه. أرجع النص المصحح فقط بدون أي شرح أو علامات اقتباس.
{{else}}
Correct spelling and grammar errors in the text above. Apply proper capitalization. Return only the corrected text without any explanation or quotation marks.
{{/if}}
`,
});

export const spellCheckFlow = ai.defineFlow(
  {
    name: 'spellCheckFlow',
    inputSchema: SpellCheckInputSchema,
    outputSchema: SpellCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function correctSpelling(input: SpellCheckInput): Promise<SpellCheckOutput> {
  return await spellCheckFlow(input);
}
