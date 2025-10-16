'use server';
/**
 * @fileOverview AI-powered mind map generation.
 *
 * - generateMindMap - Creates a structured mind map from a topic.
 * - GenerateMindMapInput - Input schema for the mind map generator.
 * - GenerateMindMapOutput - Output schema for the mind map generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMindMapInputSchema = z.object({
  topic: z.string().describe('The central topic for the mind map.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const MindMapNodeSchema: z.ZodType<any> = z.object({
    title: z.string(),
    children: z.array(z.lazy(() => MindMapNodeSchema)).optional(),
});

const GenerateMindMapOutputSchema = z.object({
  mindMap: MindMapNodeSchema.describe('The root node of the generated mind map.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;

export async function generateMindMap(
  input: GenerateMindMapInput
): Promise<GenerateMindMapOutput> {
  return generateMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapPrompt',
  input: {schema: GenerateMindMapInputSchema},
  output: {schema: GenerateMindMapOutputSchema},
  prompt: `You are an expert in creating structured mind maps. Based on the topic provided, generate a hierarchical mind map with a central topic, main branches, and sub-branches. The structure should be nested.

Topic: {{{topic}}}
`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
