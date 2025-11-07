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
  prompt: `You are an expert in creating well-structured, comprehensive mind maps for educational and organizational purposes.

Topic: {{{topic}}}

{{#if template}}
Template Style: {{{template}}}
- hierarchical: Top-down structure, perfect for processes and classifications
- radial: Central topic with radiating branches, perfect for brainstorming
- organizational: Organization chart style, perfect for structures and hierarchies  
- flowchart: Sequential flow, perfect for processes and workflows
{{/if}}

{{#if depth}}
Depth Level: {{{depth}}}
- shallow: 2-3 levels (central topic + main branches + few sub-branches)
- medium: 3-4 levels (more detailed exploration)
- deep: 4-5 levels (comprehensive, detailed mind map)
{{else}}
Default to medium depth (3-4 levels).
{{/if}}

IMPORTANT GUIDELINES:
1. Create a comprehensive, well-organized hierarchical structure
2. The root node should be the main topic
3. Add 4-7 main branches (first level children) that cover the key aspects
4. Each main branch should have 2-5 sub-branches with relevant details
5. For deeper levels, add specific examples, characteristics, or components
6. Add brief descriptions to clarify complex concepts (optional)
7. Suggest colors for main branches to make the mind map visually appealing:
   - Use distinct colors like #3B82F6 (blue), #10B981 (green), #F59E0B (amber), #EF4444 (red), #8B5CF6 (purple), #EC4899 (pink)
8. Make sure the structure is balanced - avoid one branch being much larger than others
9. Focus on clarity and logical organization

Generate a detailed, well-structured mind map that would be visually appealing and informative.`,
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
