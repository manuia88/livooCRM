// src/components/tasks/TaskMetricsGrid.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TaskMetrics } from '@/hooks/useTasks'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TaskMetricsGridProps {
    metrics?: TaskMetrics
}

export function TaskMetricsGrid({ metrics }: TaskMetricsGridProps) {
    if (!metrics) return null

    const completionRate = metrics.completion_rate || 0
    const onTimeRate = metrics.total_tasks_assigned > 0
        ? Math.round((metrics.tasks_completed_on_time / metrics.total_tasks_assigned) * 100)
        : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Tareas Completadas - Estilo Apple */}
            <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Tareas este mes</h3>
                        {completionRate >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : completionRate >= 50 ? (
                            <Minus className="h-4 w-4 text-yellow-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                            {metrics.tasks_completed}
                        </span>
                        <span className="text-sm text-gray-500">
                            / {metrics.total_tasks_assigned}
                        </span>
                    </div>
                    <Progress value={completionRate} className="mt-3 h-2" />
                    <p className="text-xs text-gray-500 mt-2">
                        {completionRate}% de tus tareas completadas
                    </p>
                </CardContent>
            </Card>

            {/* Tareas a Tiempo */}
            <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">A tiempo</h3>
                        {onTimeRate >= 90 ? (
                            <span className="text-lg">🎯</span>
                        ) : (
                            <span className="text-lg">⏱️</span>
                        )}
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                            {metrics.tasks_completed_on_time}
                        </span>
                        <span className="text-sm text-gray-500">
                            de {metrics.tasks_completed}
                        </span>
                    </div>
                    <Progress value={onTimeRate} className="mt-3 h-2" />
                    <p className="text-xs text-gray-500 mt-2">
                        {onTimeRate}% completadas a tiempo
                    </p>
                </CardContent>
            </Card>

            {/* Ranking */}
            <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Tu ranking</h3>
                        <span className="text-lg">🏆</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                            #{metrics.ranking_position || '-'}
                        </span>
                        <span className="text-sm text-gray-500">
                            de {metrics.total_agents}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        {metrics.ranking_position === 1 ? (
                            '🎉 ¡Eres el #1 del equipo!'
                        ) : metrics.ranking_position <= 3 ? (
                            '💪 ¡Estás en el top 3!'
                        ) : (
                            'Sigue así para escalar posiciones'
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
