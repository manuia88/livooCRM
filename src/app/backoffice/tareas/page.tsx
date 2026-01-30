'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskQueueModal } from '@/components/tasks/TaskQueueModal';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskMetricsGrid } from '@/components/tasks/TaskMetricsGrid';
import {
    Play,
    Plus,
    Filter,
    Calendar,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useTasks, useTaskMetrics } from '@/hooks/useTasks';

export default function BackofficeTasksPage() {
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    // Fetch tasks and metrics
    const { data: tasks, isLoading } = useTasks({ status: 'pendiente' });
    const { data: metrics } = useTaskMetrics();

    // Group tasks by priority
    const urgentTasks = tasks?.filter(t => t.priority === 'alta') || [];
    const normalTasks = tasks?.filter(t => t.priority === 'media') || [];
    const lowTasks = tasks?.filter(t => t.priority === 'baja') || [];

    // Count overdue tasks
    const overdueTasks = tasks?.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status === 'pendiente'
    ) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
                    <p className="text-gray-500 mt-1">
                        Gestiona y completa tus tareas pendientes
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva tarea
                    </Button>
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowQueueModal(true)}
                        disabled={!tasks || tasks.length === 0}
                    >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar cola de tareas
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <TaskMetricsGrid metrics={metrics} />

            {/* Filters */}
            {showFilters && (
                <TaskFilters onApplyFilters={(filters) => {
                    // Handle filters
                    console.log('Filters:', filters);
                }} />
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tasks?.length || 0}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600">Vencidas</p>
                            <p className="text-2xl font-bold text-red-700">
                                {overdueTasks.length}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Completadas</p>
                            <p className="text-2xl font-bold text-green-700">
                                {metrics?.tasks_completed || 0}
                            </p>
                            <p className="text-xs text-gray-500">este mes</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tu desempeño</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {metrics?.completion_rate || 0}%
                            </p>
                            <p className="text-xs text-gray-500">
                                #{metrics?.ranking_position || '-'} del equipo
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏆</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Lists */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-500">Cargando tareas...</p>
                </div>
            ) : !tasks || tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        ¡No tienes tareas pendientes!
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Buen trabajo. Todas tus tareas están completadas.
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear nueva tarea
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Urgent Tasks */}
                    {urgentTasks.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">🔴</span>
                                Tareas Urgentes ({urgentTasks.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urgentTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onRealize={() => {
                                            setSelectedTask(task.id);
                                            setShowQueueModal(true);
                                        }}
                                        onViewDetails={() => {
                                            setSelectedTask(task.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Normal Tasks */}
                    {normalTasks.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">🟡</span>
                                Tareas Normales ({normalTasks.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {normalTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onRealize={() => {
                                            setSelectedTask(task.id);
                                            setShowQueueModal(true);
                                        }}
                                        onViewDetails={() => {
                                            setSelectedTask(task.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Low Priority Tasks */}
                    {lowTasks.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">🟢</span>
                                Tareas de Baja Prioridad ({lowTasks.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lowTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        variant="compact"
                                        onRealize={() => {
                                            setSelectedTask(task.id);
                                            setShowQueueModal(true);
                                        }}
                                        onViewDetails={() => {
                                            setSelectedTask(task.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <TaskQueueModal
                open={showQueueModal}
                onClose={() => {
                    setShowQueueModal(false);
                    setSelectedTask(null);
                }}
                initialTaskId={selectedTask}
            />

            <CreateTaskDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
            />
        </div>
    );
}
