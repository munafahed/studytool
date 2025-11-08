'use server';
/**
 * @fileOverview AI-powered mind map generation with visual templates.
 *
 * - generateMindMap - Creates a structured mind map from a topic with customizable templates.
 * - GenerateMindMapInput - Input schema for the mind map generator.
 * - GenerateMindMapOutput - Output schema for the mind map generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMindMapInputSchema = z.object({
  topic: z.string().describe('The central topic for the mind map.'),
  template: z.enum(['hierarchical', 'radial', 'organizational', 'flowchart']).optional().describe('The visual template style for the mind map.'),
  depth: z.enum(['shallow', 'medium', 'deep']).optional().describe('How deep the mind map should go (number of levels).'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const MindMapNodeSchema: z.ZodType<any> = z.object({
    title: z.string().describe('The title/label of this node'),
    description: z.string().optional().describe('Optional short description of this node'),
    children: z.array(z.lazy(() => MindMapNodeSchema)).optional().describe('Child nodes'),
    color: z.string().optional().describe('Suggested color for this branch (hex code)'),
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
  prompt: `Create a mind map for: {{{topic}}}

Return ONLY JSON in this exact structure:
- Root: title = main topic
- children = array of 4-6 main branches
- Each branch: title (short), color (#3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #EC4899)
- Each branch.children = array of 2-4 sub-topics (with title only)

Keep titles SHORT (2-5 words max). No descriptions, no long text.`,
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
