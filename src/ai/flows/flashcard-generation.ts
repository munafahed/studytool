'use server';
/**
 * @fileOverview AI-powered flashcard generation flow.
 *
 * - generateFlashcards - A function that generates flashcards based on user input.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  text: z.string().describe('The input text for generating flashcards.'),
  count: z.number().optional().describe('The desired number of flashcards.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    front: z.string().describe("The front side of the flashcard (term or question)."),
    back: z.string().describe("The back side of the flashcard (definition or answer)."),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI assistant specialized in creating educational flashcards from a given text.

  Based on the provided text, generate a set of flashcards. Each flashcard should have a 'front' (for a key term or question) and a 'back' (for its definition or answer).
  {{#if count}}
  Please generate exactly {{count}} flashcards.
  {{/if}}

  Input Text: {{{text}}}
  `,
  config: {
    model: 'googleai/gemini-2.5-flash',
  }
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
