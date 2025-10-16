'use server';
/**
 * @fileOverview AI-powered essay/report generation flow.
 *
 * - generateEssayReport - A function that generates an essay or report based on user input.
 * - GenerateEssayReportInput - The input type for the generateEssayReport function.
 * - GenerateEssayReportOutput - The return type for the generateEssayReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEssayReportInputSchema = z.object({
  text: z.string().describe('The input text for generating the essay or report.'),
  reportType: z
    .enum(['Short', 'Detailed'])
    .describe('The desired length of the essay or report.'),
});
export type GenerateEssayReportInput = z.infer<typeof GenerateEssayReportInputSchema>;

const GenerateEssayReportOutputSchema = z.object({
  report: z.string().describe('The generated essay or report.'),
});
export type GenerateEssayReportOutput = z.infer<typeof GenerateEssayReportOutputSchema>;

export async function generateEssayReport(
  input: GenerateEssayReportInput
): Promise<GenerateEssayReportOutput> {
  return generateEssayReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEssayReportPrompt',
  input: {schema: GenerateEssayReportInputSchema},
  output: {schema: GenerateEssayReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating essays and reports.

  Based on the provided text and the desired report type, generate an appropriate essay or report.

  Input Text: {{{text}}}
  Report Type: {{{reportType}}}

  Report:`, // Removed Handlebars await expression because it is invalid.
});

const generateEssayReportFlow = ai.defineFlow(
  {
    name: 'generateEssayReportFlow',
    inputSchema: GenerateEssayReportInputSchema,
    outputSchema: GenerateEssayReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
