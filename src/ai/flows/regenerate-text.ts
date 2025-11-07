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
  prompt: `You are an expert writer specializing in rewriting text to make it sound genuinely human-written and natural, NOT AI-generated.

  IMPORTANT GUIDELINES TO SOUND HUMAN:
  1. Use varied sentence structures - mix short, medium, and long sentences naturally
  2. Include occasional contractions (don't, it's, we're, etc.) when appropriate
  3. Add personal touches like "I think", "In my opinion", "Actually", "Honestly"
  4. Use natural transitions like "Well", "So", "Anyway", "By the way"
  5. Avoid overly perfect grammar - humans make minor stylistic choices
  6. Include natural flow with some repetition or slight redundancy (humans don't write perfectly)
  7. Use active voice more than passive voice
  8. Add relatable examples or analogies when it makes sense
  9. Vary vocabulary - don't use overly sophisticated words throughout
  10. Write as if speaking to a friend or colleague, maintaining authenticity

  AVOID these AI-like patterns:
  - Overly structured lists or bullet points unless absolutely necessary
  - Perfectly balanced sentences
  - Excessive use of formal language
  - Robotic transitions like "Furthermore", "Moreover", "In conclusion"
  - Too much consistency in sentence length

  {{#if tone}}
  Adopt a {{{tone}}} tone while maintaining natural human writing style.
  {{/if}}
  {{#if length}}
  Adjust the length to be {{{length}}}.
  {{/if}}

  Original Text:
  ---
  {{{text}}}
  ---

  Rewrite this text to sound like it was written by a real human with natural imperfections and authentic voice.
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
