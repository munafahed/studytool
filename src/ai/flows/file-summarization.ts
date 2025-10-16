'use server';

/**
 * @fileOverview A file summarization AI agent.
 *
 * - summarizeFile - A function that handles the file summarization process.
 * - SummarizeFileInput - The input type for the summarizeFile function.
 * - SummarizeFileOutput - The return type for the summarizeFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummaryLengthSchema = z.enum(['short', 'medium', 'long']);

const SummarizeFileInputSchema = z.object({
  fileName: z.string().describe('The name of the file to summarize.'),
  fileDataUri: z
    .string()
    .describe(
      "The file's content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  length: SummaryLengthSchema.describe('The desired length of the summary.'),
});
export type SummarizeFileInput = z.infer<typeof SummarizeFileInputSchema>;

const SummarizeFileOutputSchema = z.object({
  summary: z.string().describe('The summarized content of the file.'),
});
export type SummarizeFileOutput = z.infer<typeof SummarizeFileOutputSchema>;

export async function summarizeFile(input: SummarizeFileInput): Promise<SummarizeFileOutput> {
  return summarizeFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFilePrompt',
  input: {schema: SummarizeFileInputSchema},
  output: {schema: SummarizeFileOutputSchema},
  prompt: `You are an expert summarizer, able to distill the key information from a file.

  Summarize the following file, taking into account the requested length.

  File name: {{{fileName}}}
  File content: {{{media url=fileDataUri}}}
  Summary length: {{{length}}}
  `,
});

const summarizeFileFlow = ai.defineFlow(
  {
    name: 'summarizeFileFlow',
    inputSchema: SummarizeFileInputSchema,
    outputSchema: SummarizeFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
