// /components/properties/PropertyTasksSection.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { Badge } from '@/components/ui/badge'
import { Plus, ListChecks } from 'lucide-react'

interface PropertyTasksSectionProps {
  propertyId: string
}

export function PropertyTasksSection({ propertyId }: PropertyTasksSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const supabase = createClient()

  // Fetch tasks related to this property
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['propertyTasks', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_tasks_with_details')
        .select('*')
        .eq('related_property_id', propertyId)
        .in('status', ['pendiente', 'en_proceso'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const pendingCount = tasks?.filter(t => t.status === 'pendiente').length || 0
  const inProgressCount = tasks?.filter(t => t.status === 'en_proceso').length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <CardTitle>Tareas de esta propiedad</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="destructive">{pendingCount} pendientes</Badge>
            )}
            {inProgressCount > 0 && (
              <Badge variant="secondary">{inProgressCount} en proceso</Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-8">
            <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No hay tareas para esta propiedad</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              Crear primera tarea
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                onRealize={() => {
                  // Navigate to task detail
                  window.location.href = `/dashboard/tasks?selected=${task.id}`
                }}
              />
            ))}
          </div>
        )}
      </CardContent>

      <CreateTaskDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </Card>
  )
}
