'use client';

import { useState } from 'react';
import { Info, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { HealthScoreBreakdown } from '@/types/property-extended';

interface PropertyHealthScoreProps {
    score: number;
    breakdown?: HealthScoreBreakdown;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
    className?: string;
}

export function PropertyHealthScore({
    score,
    breakdown,
    size = 'md',
    showDetails = false,
    className = '',
}: PropertyHealthScoreProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 border-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 border-yellow-600 bg-yellow-50';
        return 'text-red-600 border-red-600 bg-red-50';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bueno';
        return 'Mejorar';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const sizes = {
        sm: {
            text: 'text-lg',
            subtext: 'text-xs',
            padding: 'p-2',
            circleSize: 48,
        },
        md: {
            text: 'text-2xl',
            subtext: 'text-sm',
            padding: 'p-3',
            circleSize: 64,
        },
        lg: {
            text: 'text-3xl',
            subtext: 'text-base',
            padding: 'p-4',
            circleSize: 80,
        },
    };

    const { text, subtext, padding, circleSize } = sizes[size];

    // Simple badge view
    if (!showDetails && !breakdown) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge
                            variant="outline"
                            className={`${getScoreColor(score)} ${className} font-semibold`}
                        >
                            <span className="mr-1">⚡</span>
                            {score}%
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Health Score: {getScoreLabel(score)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Detailed view with breakdown
    return (
        <Card className={`${padding} ${className}`}>
            <div className="space-y-4">
                {/* Score Circle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`relative ${getScoreColor(score)} rounded-full border-4 flex items-center justify-center`}
                            style={{ width: circleSize, height: circleSize }}>
                            <div className="text-center">
                                <div className={`${text} font-bold`}>{score}</div>
                                <div className={`${subtext} -mt-1`}>%</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Health Score</h3>
                            <p className="text-sm text-muted-foreground">{getScoreLabel(score)}</p>
                        </div>
                    </div>

                    {breakdown && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Info className="h-4 w-4" />
                            {isExpanded ? 'Ocultar' : 'Ver detalles'}
                        </button>
                    )}
                </div>

                {/* Breakdown Details */}
                {breakdown && isExpanded && (
                    <div className="space-y-3 pt-3 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground">Desglose:</h4>

                        {Object.entries(breakdown.items).map(([key, item]) => {
                            const labels: Record<string, string> = {
                                coordinates: 'Ubicación GPS',
                                photos: 'Fotos',
                                video: 'Video',
                                virtual_tour: 'Tour Virtual 360°',
                                description: 'Descripción',
                                documents: 'Documentos',
                                amenities: 'Amenidades',
                            };

                            return (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {item.completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : item.points > 0 ? (
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>{labels[key]}</span>
                                        </div>
                                        <span className="font-medium">
                                            {item.points}/{item.max_points} pts
                                        </span>
                                    </div>

                                    <Progress
                                        value={(item.points / item.max_points) * 100}
                                        className="h-2"
                                    />

                                    {/* Show additional details */}
                                    {item.current_count !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.current_count} de {item.target_count} requeridos
                                        </p>
                                    )}
                                    {item.current_length !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.current_length} de {item.target_length} caracteres
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {/* Suggestions */}
                        {breakdown.suggestions && breakdown.suggestions.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                <h4 className="font-medium text-sm mb-2 text-blue-900">
                                    💡 Sugerencias para mejorar:
                                </h4>
                                <ul className="space-y-1">
                                    {breakdown.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warning if score is too low */}
                        {score < 60 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800 font-medium">
                                    ⚠️ El health score debe ser de al menos 60% para publicar la propiedad.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
