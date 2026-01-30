// src/components/tasks/TaskFilters.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface TaskFiltersProps {
    onApplyFilters: (filters: any) => void
}

export function TaskFilters({ onApplyFilters }: TaskFiltersProps) {
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        task_type: '',
    })

    const handleClear = () => {
        const cleared = {
            status: '',
            priority: '',
            task_type: '',
        }
        setFilters(cleared)
        onApplyFilters(cleared)
    }

    const handleApply = () => {
        onApplyFilters(filters)
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                        <X className="h-4 w-4 mr-1" />
                        Limpiar
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>Estado</Label>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="en_proceso">En proceso</SelectItem>
                                <SelectItem value="completada">Completada</SelectItem>
                                <SelectItem value="vencida">Vencida</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Prioridad</Label>
                        <Select
                            value={filters.priority}
                            onValueChange={(value) => setFilters({ ...filters, priority: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Tipo</Label>
                        <Select
                            value={filters.task_type}
                            onValueChange={(value) => setFilters({ ...filters, task_type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cliente_seguimiento">Seguimiento cliente</SelectItem>
                                <SelectItem value="visita_confirmar">Confirmar visita</SelectItem>
                                <SelectItem value="propiedad_mejorar_fotos">Mejorar fotos</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={handleApply}>
                        Aplicar filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
