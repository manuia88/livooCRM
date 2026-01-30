import { generateObject } from 'ai';
import { z } from 'zod';
import { geminiFlashModel } from './config';

// Define the schema for the data we want to extract
const leadProfileSchema = z.object({
    budget: z.object({
        min: z.number().optional().describe('Minimum budget in MXN'),
        max: z.number().optional().describe('Maximum budget in MXN'),
        currency: z.string().default('MXN'),
    }).optional(),
    zones: z.array(z.string()).describe('List of zones or neighborhoods of interest'),
    propertyType: z.enum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'OTHER']).optional().describe('Type of property interested in'),
    bedrooms: z.number().optional().describe('Number of bedrooms desired'),
    bathrooms: z.number().optional().describe('Number of bathrooms desired'),
    intent: z.enum(['BUY', 'RENT', 'SELL']).optional().describe('User intent'),
    timeline: z.string().optional().describe('Desired timeline for moving or buying'),
    urgency: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
});

export type LeadProfile = z.infer<typeof leadProfileSchema>;

export async function extractLeadInfo(message: string): Promise<LeadProfile> {
    try {
        const { object } = await generateObject({
            model: geminiFlashModel,
            schema: leadProfileSchema,
            prompt: `Analyze the following message from a real estate lead and extract key preferences. 
      If a specific value is not mentioned, do not invent it.
      
      Message: "${message}"`,
        });

        return object;
    } catch (error) {
        console.error('Error extracting lead info:', error);
        // Return empty partial object on failure to avoid breaking flow
        return {
            zones: [],
            budget: { currency: 'MXN' }
        };
    }
}
