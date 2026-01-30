// src/components/tasks/CreateTaskDialog.tsx
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useCreateTask } from '@/hooks/useTasks'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CreateTaskDialogProps {
    open: boolean
    onClose: () => void
}

export function CreateTaskDialog({ open, onClose }: CreateTaskDialogProps) {
    const createTaskMutation = useCreateTask()
    const [dueDate, setDueDate] = useState<Date>()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        task_type: 'general',
        priority: 'media' as 'alta' | 'media' | 'baja',
        assigned_to: '', // Will be set to current user by default
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        await createTaskMutation.mutateAsync({
            ...formData,
            due_date: dueDate?.toISOString(),
        })

        onClose()
        setFormData({
            title: '',
            description: '',
            task_type: 'general',
            priority: 'media',
            assigned_to: '',
        })
        setDueDate(undefined)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear nueva tarea</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Llamar a cliente para seguimiento"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe la tarea..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: 'alta' | 'media' | 'baja') => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="alta">🔴 Alta</SelectItem>
                                    <SelectItem value="media">🟡 Media</SelectItem>
                                    <SelectItem value="baja">🟢 Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Fecha de vencimiento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTaskMutation.isPending || !formData.title}
                        >
                            {createTaskMutation.isPending ? 'Creando...' : 'Crear tarea'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
