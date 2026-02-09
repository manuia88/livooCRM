// src/components/tasks/TaskPriorityBadge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TaskPriorityBadgeProps {
    priority: 'alta' | 'media' | 'baja' | 'urgente'
    className?: string
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
    const config = {
        urgente: {
            label: 'Urgente',
            className: 'bg-red-200 text-red-900 border-red-300',
            icon: '🔴'
        },
        alta: {
            label: 'Alta',
            className: 'bg-red-100 text-red-700 border-red-200',
            icon: '🔴'
        },
        media: {
            label: 'Media',
            className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: '🟡'
        },
        baja: {
            label: 'Baja',
            className: 'bg-green-100 text-green-700 border-green-200',
            icon: '🟢'
        }
    }

    const { label, className: priorityClass, icon } = config[priority]

    return (
        <Badge
            variant="outline"
            className={cn(
                'text-xs font-medium',
                priorityClass,
                className
            )}
        >
            <span className="mr-1">{icon}</span>
            {label}
        </Badge>
    )
}
