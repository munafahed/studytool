'use server';
/**
 * @fileOverview AI-powered text regeneration to make content sound more human-like.
 *
 * - regenerateText - A function that rewrites text to be more human-like.
 * - RegenerateTextInput - The input type for the regenerateText function.
 * - RegenerateTextOutput - The return type for the regenerateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateTextInputSchema = z.object({
  text: z.string().describe('The text to be rewritten to sound more human.'),
  tone: z.enum(['Formal', 'Casual', 'Academic']).optional().describe('The desired tone of the output text.'),
  length: z.enum(['Short', 'Medium', 'Long']).optional().describe('The desired length of the output text.'),
});
export type RegenerateTextInput = z.infer<typeof RegenerateTextInputSchema>;

const RegenerateTextOutputSchema = z.object({
  regeneratedText: z.string().describe('The rewritten, more human-like text.'),
});
export type RegenerateTextOutput = z.infer<typeof RegenerateTextOutputSchema>;

export async function regenerateText(
  input: RegenerateTextInput
): Promise<RegenerateTextOutput> {
  return regenerateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateTextPrompt',
  input: {schema: RegenerateTextInputSchema},
  output: {schema: RegenerateTextOutputSchema},
  prompt: `You are an expert writer specializing in rewriting text to make it sound more natural and human-like, while preserving its original meaning.

  Rewrite the following text.
  {{#if tone}}
  Adopt a {{{tone}}} tone.
  {{/if}}
  {{#if length}}
  Adjust the length to be {{{length}}}.
  {{/if}}

  Original Text:
  ---
  {{{text}}}
  ---
  `,
});

const regenerateTextFlow = ai.defineFlow(
  {
    name: 'regenerateTextFlow',
    inputSchema: RegenerateTextInputSchema,
    outputSchema: RegenerateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
