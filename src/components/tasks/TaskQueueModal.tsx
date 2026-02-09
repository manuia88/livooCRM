// src/components/tasks/TaskQueueModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    X,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    SkipForward,
    ExternalLink,
    User,
    Building2,
    Calendar
} from 'lucide-react'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskQueueModalProps {
    open: boolean
    onClose: () => void
    initialTaskId?: string | null
}

export function TaskQueueModal({ open, onClose, initialTaskId }: TaskQueueModalProps) {
    const router = useRouter()
    const { data: allTasksResponse } = useTasks({ status: 'pendiente' })
    const completeTaskMutation = useCompleteTask()

    const [currentIndex, setCurrentIndex] = useState(0)
    const [completedInSession, setCompletedInSession] = useState<string[]>([])

    // Filter tasks for queue (pending only)
    const tasks = allTasksResponse?.data || []
    const currentTask = tasks[currentIndex]
    const totalTasks = tasks.length
    const progress = totalTasks > 0 ? ((currentIndex + 1) / totalTasks) * 100 : 0

    // Set initial task index if provided
    useEffect(() => {
        if (initialTaskId && tasks.length > 0) {
            const index = tasks.findIndex(t => t.id === initialTaskId)
            if (index !== -1) {
                setCurrentIndex(index)
            }
        }
    }, [initialTaskId, tasks])

    const handleComplete = async () => {
        if (!currentTask) return

        try {
            await completeTaskMutation.mutateAsync(currentTask.id)
            setCompletedInSession([...completedInSession, currentTask.id])

            toast.success('Tarea completada', {
                description: `"${currentTask.title}" ha sido marcada como completada.`
            })

            // Move to next task
            if (currentIndex < totalTasks - 1) {
                setCurrentIndex(currentIndex + 1)
            } else {
                // All tasks completed!
                toast.success('¡Felicitaciones!', {
                    description: `Completaste ${completedInSession.length + 1} tareas en esta sesión.`,
                    duration: 5000
                })
                onClose()
            }
        } catch (error) {
            toast.error('Error al completar tarea')
        }
    }

    const handleSkip = () => {
        if (currentIndex < totalTasks - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            // End of queue
            onClose()
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleOpenRelated = () => {
        if (!currentTask) return

        // Navigate based on task type
        if (currentTask.related_contact_id) {
            router.push(`/dashboard/contacts/${currentTask.related_contact_id}`)
            onClose()
        } else if (currentTask.related_property_id) {
            router.push(`/dashboard/properties/${currentTask.related_property_id}`)
            onClose()
        }
    }

    if (!currentTask) {
        return null
    }

    const getSuggestion = (taskType: string) => {
        const suggestions: Record<string, string> = {
            'cliente_seguimiento': 'Envíale un mensaje preguntando si ya revisó las propiedades que le compartiste o si necesita más opciones.',
            'visita_confirmar': 'Contacta al cliente para confirmar la visita y coordina con el vendedor de la propiedad.',
            'propiedad_mejorar_fotos': 'Sube fotos de alta calidad. Recomendamos mínimo 15 fotos profesionales.',
            'propiedad_ajustar_precio': 'Revisa el análisis de valuación y ajusta el precio según las recomendaciones.',
            'consulta_responder': 'Responde la consulta del cliente lo antes posible para no perder la oportunidad.'
        }
        return suggestions[taskType] || 'Completa esta tarea para mejorar tus métricas.'
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 border-b p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Tarea {currentIndex + 1} de {totalTasks}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {completedInSession.length} completadas en esta sesión
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 text-right">
                            {Math.round(progress)}% completado
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Priority Badge */}
                    <div className="flex items-center space-x-2">
                        <TaskPriorityBadge priority={currentTask.priority} />
                        {currentTask.auto_generated && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Generada automáticamente
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {currentTask.title}
                        </h3>
                        <p className="text-gray-600">
                            {currentTask.description}
                        </p>
                    </div>

                    {/* Related Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        {currentTask.contact_name && (
                            <div className="flex items-start space-x-3">
                                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Cliente:</p>
                                    <p className="text-sm text-gray-700">{currentTask.contact_name}</p>
                                    {currentTask.contact_phone && (
                                        <p className="text-xs text-gray-500">{currentTask.contact_phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentTask.property_title && (
                            <div className="flex items-start space-x-3">
                                <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Propiedad:</p>
                                    <p className="text-sm text-gray-700">{currentTask.property_title}</p>
                                </div>
                            </div>
                        )}

                        {currentTask.due_date && (
                            <div className="flex items-start space-x-3">
                                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Vencimiento:</p>
                                    <p className="text-sm text-gray-700">
                                        {formatDistanceToNow(new Date(currentTask.due_date), {
                                            addSuffix: true,
                                            locale: es
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestion */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                            💡 Sugerencia:
                        </p>
                        <p className="text-sm text-yellow-800">
                            {getSuggestion(currentTask.task_type)}
                        </p>
                    </div>

                    {/* Action Button */}
                    {(currentTask.related_contact_id || currentTask.related_property_id) && (
                        <Button
                            className="w-full"
                            size="lg"
                            variant="outline"
                            onClick={handleOpenRelated}
                        >
                            <ExternalLink className="h-5 w-5 mr-2" />
                            {currentTask.related_contact_id ?
                                'Abrir conversación con cliente' :
                                'Abrir ficha de propiedad'
                            }
                        </Button>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t p-6 bg-gray-50">
                    <div className="flex items-center justify-between space-x-4">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                        >
                            <SkipForward className="h-4 w-4 mr-2" />
                            Saltar esta tarea
                        </Button>

                        <div className="flex items-center space-x-3">
                            {currentIndex < totalTasks - 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                            <Button
                                onClick={handleComplete}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={completeTaskMutation.isPending}
                            >
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                {completeTaskMutation.isPending ? 'Completando...' : 'Marcar como realizada'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
