'use server';

import { extractLeadInfo } from '@/lib/ai/profiler';
import { analyzeSentiment } from '@/lib/ai/sentiment';
import { queryLegalAssistant } from '@/lib/ai/rag';
import { calculateDeterministicScore, predictClosingProbability } from '@/lib/ai/scoring';
import { findSimilarProperties } from '@/lib/ai/vision';

// 1. Profiler Action
export async function aiAnalyzeMessage(message: string) {
    return await extractLeadInfo(message);
}

// 2. Sentiment Action
export async function aiAnalyzeSentiment(message: string) {
    return await analyzeSentiment(message);
}

// 3. RAG Action
export async function aiAskLegalAssistant(question: string) {
    // In a real app, we might also log the question here or check constraints
    return await queryLegalAssistant(question);
}

// 4. Scoring Actions
export async function aiCalculateScore(metrics: any) {
    return calculateDeterministicScore(metrics);
}

export async function aiPredictClosing(history: string, profile: any) {
    return await predictClosingProbability(history, profile);
}

// 5. Vision Action
export async function aiFindSimilarProperties(description: string) {
    return await findSimilarProperties(description);
}
