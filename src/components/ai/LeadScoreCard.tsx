import React from 'react';
import { Flame, ThermometerSun, Snowflake } from 'lucide-react';

interface LeadScoreCardProps {
    score: number;
    category: 'HOT' | 'WARM' | 'COLD';
    closingProbability?: number; // 0-1
    interactionCount?: number;
}

export function LeadScoreCard({ score, category, closingProbability, interactionCount }: LeadScoreCardProps) {
    const getCategoryConfig = () => {
        switch (category) {
            case 'HOT':
                return {
                    color: 'text-orange-600 bg-orange-50 border-orange-200',
                    icon: <Flame className="w-5 h-5 animate-pulse" />,
                    label: 'Hot Lead'
                };
            case 'WARM':
                return {
                    color: 'text-amber-600 bg-amber-50 border-amber-200',
                    icon: <ThermometerSun className="w-5 h-5" />,
                    label: 'Warm Lead'
                };
            case 'COLD':
                return {
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    icon: <Snowflake className="w-5 h-5" />,
                    label: 'Cold Lead'
                };
        }
    };

    const config = getCategoryConfig();

    return (
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lead Score</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-bold text-gray-900">{score}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
                            {config.icon}
                            {config.label}
                        </div>
                    </div>
                </div>
            </div>

            {closingProbability !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Est. Closing Probability</span>
                        <span className="font-semibold text-gray-900">{(closingProbability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                            style={{ width: `${closingProbability * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {interactionCount !== undefined && (
                <p className="mt-3 text-xs text-gray-400">Based on {interactionCount} interactions</p>
            )}
        </div>
    );
}
