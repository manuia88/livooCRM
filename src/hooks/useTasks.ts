// src/hooks/useTasks.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Task {
    id: string
    title: string
    description?: string
    task_type: string
    priority: 'alta' | 'media' | 'baja'
    status: 'pendiente' | 'en_proceso' | 'completada' | 'pospuesta' | 'vencida' | 'cancelada'
    due_date?: string
    created_at: string
    updated_at: string
    assigned_to: string
    assigned_to_name?: string
    assigned_to_avatar?: string
    contact_name?: string
    contact_phone?: string
    contact_email?: string
    property_title?: string
    sale_price?: number
    rent_price?: number
    auto_generated: boolean
    related_contact_id?: string
    related_property_id?: string
    related_visit_id?: string
}

export interface TaskFilters {
    status?: string
    priority?: string
    task_type?: string
    assigned_to?: string
    search?: string
}

export interface TaskMetrics {
    total_tasks_assigned: number
    tasks_completed: number
    tasks_completed_on_time: number
    tasks_completed_late: number
    tasks_overdue: number
    avg_completion_time_minutes: number
    ranking_position: number
    total_agents: number
    completion_rate: number
}

// ============================================================================
// QUERY: Get all tasks with filters
// ============================================================================
export function useTasks(filters?: TaskFilters) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: async () => {
            let query = supabase
                .from('v_tasks_with_details')
                .select('*')
                .order('created_at', { ascending: false })

            // Apply filters
            if (filters?.status) {
                query = query.eq('status', filters.status)
            }
            if (filters?.priority) {
                query = query.eq('priority', filters.priority)
            }
            if (filters?.task_type) {
                query = query.eq('task_type', filters.task_type)
            }
            if (filters?.assigned_to) {
                query = query.eq('assigned_to', filters.assigned_to)
            }
            if (filters?.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Task[]
        },
        staleTime: 30000, // 30 seconds
    })
}

// ============================================================================
// QUERY: Get single task
// ============================================================================
export function useTask(taskId: string | null) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            if (!taskId) return null

            const { data, error } = await supabase
                .from('v_tasks_with_details')
                .select('*')
                .eq('id', taskId)
                .single()

            if (error) throw error
            return data as Task
        },
        enabled: !!taskId,
    })
}

// ============================================================================
// QUERY: Get task metrics for current user
// ============================================================================
export function useTaskMetrics() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['taskMetrics'],
        queryFn: async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get current month/year
            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()

            // Get metrics
            const { data, error } = await supabase
                .from('task_performance_metrics')
                .select('*')
                .eq('user_id', user.id)
                .eq('period_month', month)
                .eq('period_year', year)
                .single()

            if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error

            // Calculate completion rate
            const completionRate = data?.total_tasks_assigned > 0
                ? Math.round((data.tasks_completed / data.total_tasks_assigned) * 100)
                : 0

            return {
                ...data,
                completion_rate: completionRate
            } as TaskMetrics
        },
        staleTime: 60000, // 1 minute
    })
}

// ============================================================================
// MUTATION: Create new task
// ============================================================================
export function useCreateTask() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (task: Partial<Task>) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    ...task,
                    created_by: user.id,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Tarea creada exitosamente')
        },
        onError: (error: any) => {
            toast.error('Error al crear tarea', {
                description: error.message
            })
        }
    })
}

// ============================================================================
// MUTATION: Update task
// ============================================================================
export function useUpdateTask() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
        },
        onError: (error: any) => {
            toast.error('Error al actualizar tarea', {
                description: error.message
            })
        }
    })
}

// ============================================================================
// MUTATION: Complete task
// ============================================================================
export function useCompleteTask() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (taskId: string) => {
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    status: 'completada',
                    completed_at: new Date().toISOString()
                })
                .eq('id', taskId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['taskMetrics'] })
        },
        onError: (error: any) => {
            toast.error('Error al completar tarea', {
                description: error.message
            })
        }
    })
}

// ============================================================================
// MUTATION: Postpone task
// ============================================================================
export function usePostponeTask() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async ({ taskId, postponeUntil }: { taskId: string; postponeUntil: Date }) => {
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    status: 'pospuesta',
                    postponed_until: postponeUntil.toISOString()
                })
                .eq('id', taskId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Tarea pospuesta')
        },
        onError: (error: any) => {
            toast.error('Error al posponer tarea', {
                description: error.message
            })
        }
    })
}

// ============================================================================
// MUTATION: Delete task
// ============================================================================
export function useDeleteTask() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (taskId: string) => {
            // Soft delete
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    deleted_at: new Date().toISOString()
                })
                .eq('id', taskId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Tarea eliminada')
        },
        onError: (error: any) => {
            toast.error('Error al eliminar tarea', {
                description: error.message
            })
        }
    })
}

// ============================================================================
// QUERY: Get team leaderboard
// ============================================================================
export function useTeamLeaderboard() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['teamLeaderboard'],
        queryFn: async () => {
            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()

            const { data, error } = await supabase
                .from('task_performance_metrics')
                .select(`
          *,
          user:user_profiles(first_name, last_name, avatar_url)
        `)
                .eq('period_month', month)
                .eq('period_year', year)
                .order('tasks_completed', { ascending: false })
                .limit(10)

            if (error) throw error
            return data
        },
        staleTime: 60000, // 1 minute
    })
}
