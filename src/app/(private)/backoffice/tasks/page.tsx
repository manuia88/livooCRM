// /src/app/backoffice/tasks/page.tsx
'use client'

import { useState } from 'react'
import { useTasks, useTaskMetrics } from '@/hooks/useTasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskMetricsGrid } from '@/components/tasks/TaskMetricsGrid'
import { TaskQueueModal } from '@/components/tasks/TaskQueueModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ListChecks, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { TaskFilters } from '@/components/tasks/TaskFilters'

export default function TasksPage() {
    const [showQueue, setShowQueue] = useState(false)
    const [filters, setFilters] = useState({})

    const { data: tasksResponse, isLoading } = useTasks(filters)
    const { data: metrics } = useTaskMetrics()

    const tasks = tasksResponse?.data || []

    // Group tasks by priority
    const urgentTasks = tasks.filter(t => t.priority === 'alta' && t.status === 'pendiente')
    const normalTasks = tasks.filter(t => t.priority === 'media' && t.status === 'pendiente')
    const lowTasks = tasks.filter(t => t.priority === 'baja' && t.status === 'pendiente')
    const overdueTasks = tasks.filter(t => t.status === 'vencida')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tareas</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona y completa tus tareas diarias
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowQueue(true)}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                        <ListChecks className="h-5 w-5 mr-2" />
                        Iniciar cola de tareas
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pendientes
                        </CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{urgentTasks.length + normalTasks.length + lowTasks.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Tareas por completar</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Vencidas
                        </CardTitle>
                        <Clock className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{overdueTasks.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Requieren atención</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Completadas
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{metrics?.tasks_completed || 0}</div>
                        <p className="text-xs text-gray-600 mt-1">Este mes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Desempeño
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {metrics?.completion_rate || 0}%
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Tasa de completado</p>
                    </CardContent>
                </Card>
            </div>

            {/* Metrics Grid */}
            {metrics && <TaskMetricsGrid metrics={metrics} />}

            {/* Filters */}
            <TaskFilters onApplyFilters={setFilters} />

            {/* Tasks Lists */}
            <div className="space-y-8">
                {/* Urgent Tasks */}
                {urgentTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                            Urgentes ({urgentTasks.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {urgentTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Normal Priority Tasks */}
                {normalTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                            Normales ({normalTasks.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {normalTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Low Priority Tasks */}
                {lowTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                            Baja prioridad ({lowTasks.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lowTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {tasks.length === 0 && !isLoading && (
                    <Card className="p-12">
                        <div className="text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">¡Todo al día!</h3>
                            <p className="text-gray-600">
                                No tienes tareas pendientes en este momento
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Task Queue Modal */}
            <TaskQueueModal
                open={showQueue}
                onClose={() => setShowQueue(false)}
            />
        </div>
    )
}
