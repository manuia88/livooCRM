// /components/contacts/ContactTasksSection.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContactTasksSectionProps {
  contactId: string
  contactName: string
  lastInteractionAt?: string
}

export function ContactTasksSection({ 
  contactId, 
  contactName,
  lastInteractionAt 
}: ContactTasksSectionProps) {
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()

  // Fetch active tasks
  const { data: activeTasks } = useQuery({
    queryKey: ['contactTasks', contactId, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_tasks_with_details')
        .select('*')
        .eq('related_contact_id', contactId)
        .in('status', ['pendiente', 'en_proceso'])
        .order('priority', { ascending: false })

      if (error) throw error
      return data
    }
  })

  // Fetch completed tasks (history)
  const { data: completedTasks } = useQuery({
    queryKey: ['contactTasks', contactId, 'completed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_tasks_with_details')
        .select('*')
        .eq('related_contact_id', contactId)
        .eq('status', 'completada')
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: showHistory
  })

  // Check if needs followup
  const needsFollowup = lastInteractionAt && 
    new Date(lastInteractionAt) < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

  const hasOverdueTasks = activeTasks?.some(t => 
    t.due_date && new Date(t.due_date) < new Date()
  )

  return (
    <div className="space-y-4">
      {/* Alert if needs followup */}
      {needsFollowup && !activeTasks?.some(t => t.task_type === 'cliente_seguimiento') && (
        <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Cliente requiere seguimiento
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Última interacción: {formatDistanceToNow(new Date(lastInteractionAt!), {
                    addSuffix: true,
                    locale: es
                  })}
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={async () => {
                    // Auto-generate followup task
                    const { error } = await supabase.rpc('auto_generate_client_followup_task', {
                      p_contact_id: contactId,
                      p_days_since_last_interaction: Math.floor(
                        (Date.now() - new Date(lastInteractionAt!).getTime()) / (1000 * 60 * 60 * 24)
                      )
                    })

                    if (!error) {
                      // Refresh tasks
                      window.location.reload()
                    }
                  }}
                >
                  Generar tarea de seguimiento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active tasks */}
      <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Tareas activas</CardTitle>
              {activeTasks && activeTasks.length > 0 && (
                <Badge variant={hasOverdueTasks ? 'destructive' : 'default'}>
                  {activeTasks.length}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!activeTasks || activeTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No hay tareas pendientes con este cliente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant="compact"
                  onRealize={() => {
                    // Open task queue starting from this task
                    window.location.href = `/dashboard/tasks?start=${task.id}`
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? 'Ocultar historial' : 'Ver historial de tareas'}
      </Button>

      {/* History */}
      {showHistory && completedTasks && completedTasks.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Historial de tareas completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl bg-gray-50/80"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Completada {formatDistanceToNow(new Date(task.completed_at!), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
