'use server';
/**
 * @fileOverview AI-powered question generation flow.
 *
 * - generateQuestions - A function that generates questions based on user input.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The input text for generating questions.'),
  questionType: z.enum(['mcq', 'true_false', 'short_answer', 'essay', 'mixed']).optional().default('mixed').describe('The type of questions to generate.'),
  numQuestions: z.number().optional().default(5).describe('The number of questions to generate.'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated questions.'),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an AI assistant specialized in generating insightful questions from a given text.

Based on the provided text, generate {{numQuestions}} questions of the type "{{questionType}}".

Question Types:
- mcq: Multiple choice questions (provide 4 options labeled A, B, C, D)
- true_false: True or False questions
- short_answer: Questions requiring brief answers (1-2 sentences)
- essay: Questions requiring detailed answers
- mixed: A mix of different question types

Input Text:
---
{{{text}}}
---

Generate the questions now:`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
