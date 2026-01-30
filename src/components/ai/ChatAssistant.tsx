'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Scale } from 'lucide-react';

// This would typically involve a server action to call our RAG logic
// For now, we mock the submission interface.

export function ChatAssistant() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            // In a real implementation:
            // const answer = await askLegalAssistantAction(query);

            // Simulating network/AI delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock response for UI preview
            setResponse("Based on the provided context, the notary fees in Mexico City typically range between 4% and 7% of the property value, including taxes and fees. This triggers the ISAI (Impuesto Sobre Adquisición de Inmuebles).");

        } catch (error) {
            setResponse("Sorry, I encountered an error consulting the legal database.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Scale className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-white font-medium">Legal & Fiscal Assistant</h3>
                    <p className="text-slate-400 text-xs">Powered by Nexus Cortex</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
                {!response && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <Sparkles className="w-12 h-12 mb-3 text-indigo-200" />
                        <p className="text-sm">Ask me about taxes, notary processes, or mortgage regulations.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}

                {response && (
                    <>
                        <div className="flex justify-end mb-4">
                            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-sm">
                                {query}
                            </div>
                        </div>
                        <div className="flex justify-start mb-4">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm max-w-[90%] text-sm text-gray-700 leading-relaxed">
                                <div className="mb-2 font-semibold text-indigo-900 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                    Nexus AI
                                </div>
                                {response}
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                Legal Disclaimer: Information for reference only.
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleAsk} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a legal question..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
