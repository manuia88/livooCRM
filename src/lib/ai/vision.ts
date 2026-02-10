import { embed } from 'ai';
import { geminiVisionModel, textEmbeddingModel } from './config';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function generateImageDescription(imageUrl: string): Promise<string> {
    // 1. We might want to use a multimodal approach: Get description first
    // Note: Vercel AI SDK 'embed' primarily works with text. 
    // For image embeddings directly, we often use a multimodal embedding model or describing it first.
    // Gemini 2.0 Flash is multimodal. For now, let's assume we extract a rich description
    // then embed that description, OR use a specialized multimodal embedding if available in SDK.

    // Current approach: Describe image -> Embed text.
    // This is often more reliable than raw image vector if the vector model isn't specialized for property retrieval.

    return "Features of the house including style, distribution and colors.";
    // TODO: Implement actual image-to-text call when Vercel SDK supports image inputs for 'generateText' cleanly with Gemini
}

export async function findSimilarProperties(description: string) {
    try {
        // 1. Generate embedding for the search query (description of the house)
        const { embedding } = await embed({
            model: textEmbeddingModel,
            value: description,
        });

        // 2. Search in Supabase using pgvector
        const { data: properties, error } = await getSupabase().rpc('match_properties', {
            query_embedding: embedding,
            match_threshold: 0.7, // Similarity threshold
            match_count: 5,       // Top 5 results
        });

        if (error) throw error;
        return properties;
    } catch (error) {
        console.error('Error finding similar properties:', error);
        return [];
    }
}

// Note: You needs to create the 'match_properties' RPC function in Supabase
// migration file.
