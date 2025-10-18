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

const QuestionItemSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).optional().describe('Options for MCQ or True/False questions (A, B, C, D or True, False).'),
  answer: z.string().describe('The correct answer.'),
  type: z.enum(['mcq', 'true_false', 'short_answer', 'essay']).describe('The type of the question.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionItemSchema).describe('An array of generated questions with their answers.'),
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

Question Types and Format:
- mcq: Multiple choice questions with 4 options (A, B, C, D). Provide the question, all 4 options, and the correct answer.
- true_false: True or False questions. Provide the question, two options ["True", "False"], and the correct answer.
- short_answer: Questions requiring brief answers (1-2 sentences). Provide the question and the correct answer.
- essay: Questions requiring detailed answers. Provide the question and key points for the answer.
- mixed: A mix of different question types

IMPORTANT INSTRUCTIONS:
- For MCQ: Always provide exactly 4 options in the "options" array
- For True/False: Always provide exactly 2 options ["True", "False"] in the "options" array
- For all question types: Always include the correct "answer" field
- The "answer" should be the correct option letter (A/B/C/D) for MCQ, "True" or "False" for true_false, or the actual answer text for short_answer and essay questions

Input Text:
---
{{{text}}}
---

Generate the questions now in the structured format:`,
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
