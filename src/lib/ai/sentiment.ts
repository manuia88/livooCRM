import { generateObject } from 'ai';
import { z } from 'zod';
import { geminiFlashModel } from './config';

const sentimentSchema = z.object({
    score: z.number().min(0).max(100).describe('Sentiment score from 0 (Negative) to 100 (Positive). 50 is Neutral.'),
    label: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
    flags: z.array(z.string()).describe('Keywords or topics detected (e.g., "price complaint", "urgent", "happy")'),
});

export type SentimentResult = z.infer<typeof sentimentSchema>;

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
        const { object } = await generateObject({
            model: geminiFlashModel,
            schema: sentimentSchema,
            prompt: `Analyze the sentiment of the following real estate client message.
      Context: A client chatting with a real estate agent.
      
      Message: "${text}"`,
        });

        return object;
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return { score: 50, label: 'NEUTRAL', flags: [] };
    }
}
