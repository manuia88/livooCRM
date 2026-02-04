// src/components/tasks/TaskCard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'
import {
    MoreVertical,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    ChevronRight,
    AlertCircle,
    Building2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TaskCardProps {
    task: {
        id: string
        title: string
        description?: string
        task_type: string
        priority: 'alta' | 'media' | 'baja'
        status: 'pendiente' | 'en_proceso' | 'completada' | 'pospuesta' | 'vencida' | 'cancelada'
        due_date?: string
        created_at: string
        assigned_to_name?: string
        assigned_to_avatar?: string
        contact_name?: string
        property_title?: string
        auto_generated: boolean
    }
    onRealize?: () => void
    onPostpone?: () => void
    onViewDetails?: () => void
    onComplete?: () => void
    variant?: 'default' | 'compact'
}

export function TaskCard({
    task,
    onRealize,
    onPostpone,
    onViewDetails,
    onComplete,
    variant = 'default'
}: TaskCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'pendiente'
    const isDueSoon = task.due_date && !isOverdue && (
        new Date(task.due_date).getTime() - new Date().getTime() < 2 * 60 * 60 * 1000 // <2 horas
    )

    const getTaskTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'cliente_seguimiento': 'Seguimiento de cliente',
            'visita_confirmar': 'Confirmar visita',
            'propiedad_mejorar_fotos': 'Mejorar fotos',
            'propiedad_ajustar_precio': 'Ajustar precio',
            'propiedad_completar_docs': 'Completar documentos',
            'propiedad_health_score': 'Mejorar health score',
            'consulta_responder': 'Responder consulta',
            'general': 'Tarea general'
        }
        return labels[type] || type
    }

    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    "flex items-center justify-between p-4 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer transition-all duration-300",
                    isOverdue && "border-red-200 bg-red-50/50"
                )}
                onClick={onViewDetails}
            >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <TaskPriorityBadge priority={task.priority} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                            {getTaskTypeLabel(task.task_type)}
                        </p>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
        )
    }

    return (
        <Card
            className={cn(
                "bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 transition-all duration-300 hover:scale-[1.02]",
                isHovered && "shadow-2xl",
                isOverdue && "border-red-300 bg-red-50/30"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <TaskPriorityBadge priority={task.priority} />
                        {task.auto_generated && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Auto
                            </span>
                        )}
                        {isOverdue && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Vencida
                            </span>
                        )}
                        {isDueSoon && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                Urgente
                            </span>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onViewDetails}>
                                Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onPostpone}>
                                Posponer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onComplete} className="text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar como completada
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Title and Description */}
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Task Type */}
                <div className="text-xs text-gray-500 mb-3">
                    {getTaskTypeLabel(task.task_type)}
                </div>

                {/* Related Info */}
                {(task.contact_name || task.property_title) && (
                    <div className="space-y-1 mb-3">
                        {task.contact_name && (
                            <div className="flex items-center text-xs text-gray-600">
                                <User className="h-3 w-3 mr-1.5" />
                                Cliente: {task.contact_name}
                            </div>
                        )}
                        {task.property_title && (
                            <div className="flex items-center text-xs text-gray-600">
                                <Building2 className="h-3 w-3 mr-1.5" />
                                Propiedad: {task.property_title}
                            </div>
                        )}
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                        {task.due_date && (
                            <div className={cn(
                                "flex items-center",
                                isOverdue && "text-red-600 font-medium"
                            )}>
                                <Calendar className="h-3 w-3 mr-1" />
                                Vence {formatDistanceToNow(new Date(task.due_date), {
                                    addSuffix: true,
                                    locale: es
                                })}
                            </div>
                        )}
                        {!task.due_date && (
                            <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Creada {formatDistanceToNow(new Date(task.created_at), {
                                    addSuffix: true,
                                    locale: es
                                })}
                            </div>
                        )}
                    </div>

                    {task.assigned_to_name && (
                        <div className="flex items-center space-x-1">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assigned_to_avatar} />
                                <AvatarFallback className="text-xs">
                                    {task.assigned_to_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">
                                {task.assigned_to_name.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Footer with Actions */}
            <CardFooter className="p-4 pt-0 flex space-x-2">
                <Button
                    size="sm"
                    className="flex-1"
                    onClick={onRealize}
                >
                    Realizar
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onViewDetails}
                >
                    Ver detalles
                </Button>
            </CardFooter>
        </Card>
    )
}
