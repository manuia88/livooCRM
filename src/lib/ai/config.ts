import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Helper to safely get the AI provider
const getGoogleProvider = () => {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        if (typeof window === 'undefined') { // Only warn on server side or build time to avoid spam
            console.warn('Missing GOOGLE_GENERATIVE_AI_API_KEY. AI features will not work.');
        }
        // Return a dummy provider configuration that will throw standard AI SDK errors 
        // only when specific calls are made, rather than crashing at initialization.
        // We pass a dummy key to satisfy the constructor.
        return createGoogleGenerativeAI({ apiKey: 'dummy-key-for-build' });
    }
    return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
};

export const google = getGoogleProvider();

export const geminiFlashModel = google('gemini-2.0-flash-exp');
export const geminiVisionModel = google('gemini-2.0-flash-exp');
export const textEmbeddingModel = google.textEmbeddingModel('text-embedding-004');
