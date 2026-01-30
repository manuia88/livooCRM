import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

interface SentimentIndicatorProps {
    score: number;
    label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    variant?: 'badge' | 'full';
}

export function SentimentIndicator({ score, label, variant = 'badge' }: SentimentIndicatorProps) {
    const getColor = () => {
        switch (label) {
            case 'POSITIVE': return 'text-green-600 bg-green-100 hover:bg-green-200 border-green-200';
            case 'NEGATIVE': return 'text-red-600 bg-red-100 hover:bg-red-200 border-red-200';
            default: return 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-gray-200';
        }
    };

    const getIcon = () => {
        switch (label) {
            case 'POSITIVE': return <Smile className="w-4 h-4" />;
            case 'NEGATIVE': return <Frown className="w-4 h-4" />;
            default: return <Meh className="w-4 h-4" />;
        }
    };

    if (variant === 'badge') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${getColor()}`}>
                {getIcon()}
                <span>{label}</span>
                <span className="opacity-60 text-[10px]">({score})</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col p-4 rounded-xl border ${getColor()}`}>
            <div className="flex items-center gap-2 mb-2">
                {getIcon()}
                <span className="font-semibold">{label} Sentiment</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mt-1">
                <div
                    className="h-full rounded-full bg-current transition-all duration-500"
                    style={{ width: `${score}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-xs opacity-70">
                <span>Intensity</span>
                <span>{score}/100</span>
            </div>
        </div>
    );
}
