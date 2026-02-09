'use client';

import { useState } from 'react';
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer';
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
    AlertCircle,
    ListChecks
} from 'lucide-react';
import { useTasks, useTaskMetrics } from '@/hooks/useTasks';

export default function BackofficeTasksPage() {
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    // Fetch tasks and metrics
    const { data: tasksResponse, isLoading } = useTasks({ status: 'pendiente' });
    const { data: metrics } = useTaskMetrics();

    const tasks = tasksResponse?.data || [];

    // Group tasks by priority
    const urgentTasks = tasks.filter(t => t.priority === 'alta');
    const normalTasks = tasks.filter(t => t.priority === 'media');
    const lowTasks = tasks.filter(t => t.priority === 'baja');

    // Count overdue tasks
    const overdueTasks = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status === 'pendiente'
    );

    return (
        <PageContainer
            title="Tareas"
            subtitle="Gestiona y completa tus tareas pendientes"
            icon={ListChecks}
            actions={
                <div className="flex items-center space-x-3">
                    <AppleButton
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-5 w-5 mr-2" />
                        Filtros
                    </AppleButton>
                    <AppleButton
                        variant="secondary"
                        onClick={() => setShowCreateDialog(true)}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nueva tarea
                    </AppleButton>
                    <AppleButton
                        size="lg"
                        onClick={() => setShowQueueModal(true)}
                        disabled={!tasks || tasks.length === 0}
                    >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar cola de tareas
                    </AppleButton>
                </div>
            }
        >

            {/* Metrics Grid */}
            <TaskMetricsGrid metrics={metrics} />

            {/* Filters */}
            {showFilters && (
                <TaskFilters onApplyFilters={(filters) => {
                    // Handle filters
                    console.log('Filters:', filters);
                }} />
            )}

            {/* Summary Cards - Estilo Apple */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900">
                                {tasks?.length || 0}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 mb-1">Vencidas</p>
                            <p className="text-2xl sm:text-3xl font-black text-red-700">
                                {overdueTasks.length}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 mb-1">Completadas</p>
                            <p className="text-2xl sm:text-3xl font-black text-green-700">
                                {metrics?.tasks_completed || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">este mes</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tu desempeño</p>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900">
                                {metrics?.completion_rate || 0}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                #{metrics?.ranking_position || '-'} del equipo
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-2xl">🏆</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Lists */}
            {isLoading ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando tareas...</p>
                </div>
            ) : !tasks || tasks.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 px-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        ¡No tienes tareas pendientes!
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Buen trabajo. Todas tus tareas están completadas.
                    </p>
                    <AppleButton size="lg" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        Crear nueva tarea
                    </AppleButton>
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
        </PageContainer>
    );
}
