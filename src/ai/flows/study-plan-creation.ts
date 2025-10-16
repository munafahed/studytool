'use server';
/**
 * @fileOverview AI-powered study plan creation.
 *
 * - createStudyPlan - Generates a study plan based on subjects and deadlines.
 * - CreateStudyPlanInput - Input schema for the study plan creator.
 * - CreateStudyPlanOutput - Output schema for the study plan creator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateStudyPlanInputSchema = z.object({
  subjects: z.string().describe('A list of subjects, topics, or tasks to include in the study plan.'),
  deadlines: z.string().optional().describe('Any relevant deadlines or timeframes for the study plan.'),
});
export type CreateStudyPlanInput = z.infer<typeof CreateStudyPlanInputSchema>;

const CreateStudyPlanOutputSchema = z.object({
  plan: z.string().describe('The generated study plan as a formatted text string.'),
});
export type CreateStudyPlanOutput = z.infer<typeof CreateStudyPlanOutputSchema>;

export async function createStudyPlan(
  input: CreateStudyPlanInput
): Promise<CreateStudyPlanOutput> {
  return createStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createStudyPlanPrompt',
  input: {schema: CreateStudyPlanInputSchema},
  output: {schema: CreateStudyPlanOutputSchema},
  prompt: `You are an academic advisor who helps students create effective study plans. Based on the subjects and deadlines provided, generate a structured and actionable study plan. The plan should be easy to read and follow. Break it down by day or week as appropriate.

Subjects/Tasks: {{{subjects}}}
{{#if deadlines}}
Deadlines/Timeframe: {{{deadlines}}}
{{/if}}
`,
});

const createStudyPlanFlow = ai.defineFlow(
  {
    name: 'createStudyPlanFlow',
    inputSchema: CreateStudyPlanInputSchema,
    outputSchema: CreateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
