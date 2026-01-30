// src/components/tasks/TaskStatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    Clock,
    CheckCircle2,
    XCircle,
    Pause,
    AlertCircle
} from 'lucide-react'

interface TaskStatusBadgeProps {
    status: 'pendiente' | 'en_proceso' | 'completada' | 'pospuesta' | 'vencida' | 'cancelada'
    className?: string
    showIcon?: boolean
}

export function TaskStatusBadge({
    status,
    className,
    showIcon = true
}: TaskStatusBadgeProps) {
    const config = {
        pendiente: {
            label: 'Pendiente',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
            icon: Clock
        },
        en_proceso: {
            label: 'En proceso',
            className: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: Clock
        },
        completada: {
            label: 'Completada',
            className: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircle2
        },
        pospuesta: {
            label: 'Pospuesta',
            className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: Pause
        },
        vencida: {
            label: 'Vencida',
            className: 'bg-red-100 text-red-700 border-red-200',
            icon: AlertCircle
        },
        cancelada: {
            label: 'Cancelada',
            className: 'bg-gray-100 text-gray-500 border-gray-200',
            icon: XCircle
        }
    }

    const { label, className: statusClass, icon: Icon } = config[status]

    return (
        <Badge
            variant="outline"
            className={cn(
                'text-xs font-medium',
                statusClass,
                className
            )}
        >
            {showIcon && <Icon className="mr-1 h-3 w-3" />}
            {label}
        </Badge>
    )
}
