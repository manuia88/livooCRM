'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
    AlertTriangle,
    Clock,
    CheckCircle2,
    GraduationCap,
    Home,
    Users
} from 'lucide-react'

interface PriorityAction {
    id: string
    action_type: string
    priority_level: number
    title: string
    description: string
    action_url: string
}

export function PriorityWidget({ actions }: { actions?: PriorityAction[] }) {
    const router = useRouter()

    if (!actions || actions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        Todo al día
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">No tienes acciones prioritarias pendientes.</p>
                </CardContent>
            </Card>
        )
    }

    // Tomar las top 4 acciones más prioritarias
    const topActions = actions.slice(0, 4)

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'suspended_advisor': return <Users className="h-8 w-8 text-red-600" />
            case 'expired_offer': return <Home className="h-8 w-8 text-orange-600" />
            case 'overdue_task': return <Clock className="h-8 w-8 text-amber-600" />
            case 'pending_course': return <GraduationCap className="h-8 w-8 text-blue-600" />
            default: return <AlertTriangle className="h-8 w-8 text-gray-600" />
        }
    }

    const getActionButton = (type: string) => {
        switch (type) {
            case 'suspended_advisor': return 'Ver detalle'
            case 'expired_offer': return 'Actualizar'
            case 'overdue_task': return 'Realizar'
            case 'pending_course': return 'Ver curso'
            default: return 'Ver'
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>¿Qué debo hacer hoy?</CardTitle>
                    <Button variant="ghost" size="sm">
                        Cambiar usuario
                    </Button>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-red-600">Prioridad 1</Badge>
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topActions.map((action) => (
                        <Card key={action.id} className="border-2 hover:border-blue-400 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center space-y-3">
                                    {getActionIcon(action.action_type)}
                                    <div>
                                        <p className="font-semibold text-sm">{action.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full bg-black hover:bg-gray-800"
                                        onClick={() => router.push(action.action_url)}
                                    >
                                        {getActionButton(action.action_type)}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
