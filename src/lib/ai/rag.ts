import { embed, generateText } from 'ai';
import { geminiFlashModel, textEmbeddingModel } from './config';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// 1. Ingest/Embed Document
export async function embedLegalDocument(content: string, metadata: any = {}) {
    try {
        const { embedding } = await embed({
            model: textEmbeddingModel,
            value: content,
        });

        const { error } = await getSupabase().from('legal_documents').insert({
            content,
            metadata,
            embedding,
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error embedding document:', error);
        return false;
    }
}

// 2. RAG Query Loop
export async function queryLegalAssistant(question: string) {
    try {
        // A. Generate embedding for question
        const { embedding } = await embed({
            model: textEmbeddingModel,
            value: question,
        });

        // B. Search closely related docs
        const { data: documents, error } = await getSupabase().rpc('match_legal_docs', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 3,
        });

        if (error) throw error;

        // C. Construct Context
        const context = documents?.map((d: any) => d.content).join('\n\n') || "No specific legal documents found.";

        // D. Generate Answer with Context
        const { text } = await generateText({
            model: geminiFlashModel,
            prompt: `You are a helpful Legal & Fiscal assistant for Mexican Real Estate.
      Use the provided context to answer the user's question accurately.
      If the answer is not in the context, use your general knowledge but mention you are not a lawyer.
      
      Context:
      ${context}
      
      User Question: "${question}"
      
      Answer:`,
        });

        return text;
    } catch (error) {
        console.error('Error in Legal RAG:', error);
        return "Lo siento, no puedo procesar tu consulta legal en este momento.";
    }
}
