import { generateObject } from 'ai';
import { z } from 'zod';
import { geminiFlashModel } from './config';

// ------------------------------------------------------------------
// LEAD SCORING ALGORITHM (Deterministic + AI Hybrid)
// ------------------------------------------------------------------

interface InteractionMetrics {
    messageCount: number;
    lastInteractionDays: number;
    hasPhone: boolean;
    hasBudget: boolean;
    hasZone: boolean;
}

export function calculateDeterministicScore(metrics: InteractionMetrics): number {
    let score = 0;

    // 1. Profile Completeness (Max 40)
    if (metrics.hasPhone) score += 20;
    if (metrics.hasBudget) score += 10;
    if (metrics.hasZone) score += 10;

    // 2. Engagement (Max 60)
    // Recent interaction bonus
    if (metrics.lastInteractionDays <= 2) score += 30;
    else if (metrics.lastInteractionDays <= 7) score += 15;
    else if (metrics.lastInteractionDays <= 14) score += 5;

    // Volume of interaction
    if (metrics.messageCount > 10) score += 30;
    else if (metrics.messageCount > 5) score += 15;
    else if (metrics.messageCount > 0) score += 5;

    return Math.min(100, score);
}

// ------------------------------------------------------------------
// CLOSING PREDICTION (AI Model)
// ------------------------------------------------------------------

const predictionSchema = z.object({
    closingProbability: z.number().describe('Probability of closing between 0 and 1'),
    reasoning: z.string().describe('Short explanation of why this probability was assigned'),
    suggestedAction: z.string().describe('Recommended next step for the agent'),
});

export async function predictClosingProbability(
    interactionHistory: string,
    leadProfile: any
) {
    try {
        const { object } = await generateObject({
            model: geminiFlashModel,
            schema: predictionSchema,
            prompt: `Analyze this lead's interaction history and profile to predict the probability of closing a deal.
      
      Lead Profile: ${JSON.stringify(leadProfile)}
      Recent Interactions: "${interactionHistory}"
      
      Factors to consider:
      - Urgency expressed
      - Specificity of requirements
      - Budget realism
      - Responsiveness`,
        });

        return object;
    } catch (error) {
        console.error('Error predicting closing:', error);
        return { closingProbability: 0.1, reasoning: 'Insufficient data', suggestedAction: 'Follow up' };
    }
}
