'use client';

import React, { useState } from 'react';
import { ChatAssistant } from '@/components/ai/ChatAssistant';
import { SentimentIndicator } from '@/components/ai/SentimentIndicator';
import { LeadScoreCard } from '@/components/ai/LeadScoreCard';
import { aiAnalyzeMessage, aiAnalyzeSentiment, aiPredictClosing } from '@/app/actions/ai';

export default function CortexPlayground() {
    // Profiler State
    const [profilerInput, setProfilerInput] = useState('Busco casa en Polanco por 8 millones con 3 recámaras urgente');
    const [profileResult, setProfileResult] = useState<any>(null);
    const [profilerLoading, setProfilerLoading] = useState(false);

    // Sentiment State
    const [sentimentInput, setSentimentInput] = useState('Estoy frustrado porque no me contestan rápido y el precio es muy alto.');
    const [sentimentResult, setSentimentResult] = useState<any>(null);

    // Execute Profiler
    const handleProfile = async () => {
        setProfilerLoading(true);
        const res = await aiAnalyzeMessage(profilerInput);
        setProfileResult(res);
        setProfilerLoading(false);
    };

    // Execute Sentiment
    const handleSentiment = async () => {
        const res = await aiAnalyzeSentiment(sentimentInput);
        setSentimentResult(res);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-indigo-900">The Cortex <span className="text-indigo-500 text-lg font-normal">| AI Playground</span></h1>
                <p className="text-slate-500">Testing ground for Team 7 AI Features</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* SECTION 1: NLP PROFILER */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 p-1 rounded-md">🧠</span> Chat Profiler
                    </h2>
                    <textarea
                        value={profilerInput}
                        onChange={(e) => setProfilerInput(e.target.value)}
                        className="w-full p-4 border rounded-xl bg-slate-50 mb-4 h-24 text-sm focus:ring-2 ring-indigo-500 outline-none"
                        placeholder="Wnter lead message..."
                    />
                    <button
                        onClick={handleProfile}
                        disabled={profilerLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full disabled:opacity-50"
                    >
                        {profilerLoading ? 'Analyzing...' : 'Extract Data'}
                    </button>

                    {profileResult && (
                        <div className="mt-4 bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-auto">
                            <pre>{JSON.stringify(profileResult, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* SECTION 2: SENTIMENT RADAR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-pink-100 p-1 rounded-md">❤️</span> Sentiment Radar
                    </h2>
                    <div className="flex gap-4 mb-4 items-start">
                        <textarea
                            value={sentimentInput}
                            onChange={(e) => setSentimentInput(e.target.value)}
                            className="flex-1 p-3 border rounded-xl bg-slate-50 text-sm h-24"
                            placeholder="Message to analyze..."
                        />
                        <button
                            onClick={handleSentiment}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 h-full"
                        >
                            Scan
                        </button>
                    </div>

                    {sentimentResult && (
                        <div className="flex justify-center p-4 bg-slate-50 rounded-xl">
                            <SentimentIndicator
                                score={sentimentResult.score}
                                label={sentimentResult.label}
                                variant="full"
                            />
                        </div>
                    )}
                </div>

                {/* SECTION 3: LEAD SCORING */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-orange-100 p-1 rounded-md">🔥</span> Lead Scoring
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <LeadScoreCard score={85} category="HOT" closingProbability={0.78} interactionCount={12} />
                        <LeadScoreCard score={45} category="WARM" closingProbability={0.35} interactionCount={4} />
                    </div>
                </div>

                {/* SECTION 4: RAG ASSISTANT */}
                <div className="row-span-2">
                    <div className="mb-2">
                        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                            <span className="bg-green-100 p-1 rounded-md">⚖️</span> Legal Assistant
                        </h2>
                        <p className="text-sm text-slate-500">RAG System connected to Legal Docs</p>
                    </div>

                    <ChatAssistant />
                </div>

            </div>
        </div>
    );
}
