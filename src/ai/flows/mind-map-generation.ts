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
  prompt: `You are an expert in creating well-structured mind maps. Generate a hierarchical JSON structure.

Topic: {{{topic}}}

STRUCTURE REQUIREMENTS:
- Root node with "title" containing the main topic "{{{topic}}}"
- "children" array with 4-7 main branches
- Each main branch has:
  * "title": clear, concise label (2-5 words)
  * "color": one of #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #EC4899
  * "children": array of sub-topics (for medium/deep depth)

DEPTH: {{#if depth}}{{{depth}}}{{else}}medium{{/if}}
- shallow: 2 levels only (4-6 main branches, NO children on them)
- medium: 3 levels (4-7 main branches, each with 2-5 children)
- deep: 4-5 levels (4-7 main branches, each with 3-6 children, some children have sub-children)

EXAMPLE OUTPUT STRUCTURE:
{
  "mindMap": {
    "title": "Main Topic",
    "color": "#3B82F6",
    "children": [
      {
        "title": "First Main Branch",
        "color": "#10B981",
        "children": [
          {"title": "Sub-topic 1"},
          {"title": "Sub-topic 2"}
        ]
      },
      {
        "title": "Second Main Branch",
        "color": "#F59E0B",
        "children": [
          {"title": "Sub-topic A"},
          {"title": "Sub-topic B"}
        ]
      }
    ]
  }
}

Create a well-organized, balanced mind map with clear, concise titles.`,
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
