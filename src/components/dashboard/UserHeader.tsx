'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface UserHeaderProps {
    summary: {
        user_level: string
        objective: {
            target: number
            current: number
            percentage: number
            period: string
        }
    }
}

export function UserHeader({ summary }: UserHeaderProps) {
    const user = {
        name: 'Agustín',
        avatar: '/avatars/user.jpg',
        level: summary?.user_level || 'Broker Profesional'
    }

    const objective = summary?.objective || { target: 0, current: 0, percentage: 0 }
    const progress = objective.percentage

    // Generar dots de progreso (10 dots, llenar según porcentaje)
    const totalDots = 10
    const filledDots = Math.round((progress / 100) * totalDots)

    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                    {/* Left: User info */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-white">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div>
                            <h1 className="text-2xl font-bold">¡Hola {user.name}!</h1>
                            <Badge variant="secondary" className="mt-1">
                                {user.level}
                            </Badge>
                        </div>
                    </div>

                    {/* Center: Objective progress */}
                    <div className="flex-1 max-w-md mx-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">
                                {formatCurrency(objective.current)} alcanzado
                            </span>
                            <span className="text-sm text-gray-300">
                                (últimos 6 meses)
                            </span>
                        </div>

                        {/* Progress bar con dots */}
                        <div className="relative">
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between mt-1">
                                {Array.from({ length: totalDots }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < filledDots ? 'bg-blue-400' : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end mt-1">
                            <span className="text-sm text-gray-300">
                                {formatCurrency(objective.target)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div>
                        <Button variant="outline" size="sm" className="text-gray-900">
                            Cambiar usuario
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
