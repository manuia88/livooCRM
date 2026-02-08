'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export interface Task {
    id: string
    title: string
    description?: string
    task_type: string
    priority: 'alta' | 'media' | 'baja' | 'urgente'
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

export interface UseTasksParams {
    page?: number
    pageSize?: number
    status?: string
    priority?: string
    taskType?: string
    assignedTo?: string
    includeOverdue?: boolean
    searchQuery?: string
    sortBy?: 'due_date' | 'created_at' | 'priority'
    sortOrder?: 'asc' | 'desc'
}

export interface TasksResponse {
    data: Task[]
    count: number
    page: number
    pageSize: number
    totalPages: number
    hasMore: boolean
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

// Hook principal con paginación
export function useTasks(params: UseTasksParams = {}) {
    const {
        page = 1,
        pageSize = 20,
        status,
        priority,
        taskType,
        assignedTo,
        includeOverdue = true,
        searchQuery,
        sortBy = 'due_date',
        sortOrder = 'asc'
    } = params

    return useQuery<TasksResponse>({
        queryKey: ['tasks', { page, pageSize, status, priority, taskType, assignedTo, includeOverdue, searchQuery, sortBy, sortOrder }],
        queryFn: async () => {
            const from = (page - 1) * pageSize
            const to = from + pageSize - 1

            let query = supabase
                .from('v_tasks_with_details')
                .select('*', { count: 'exact' })

            if (status) query = query.eq('status', status)
            if (priority) query = query.eq('priority', priority)
            if (taskType) query = query.eq('task_type', taskType)
            if (assignedTo) query = query.eq('assigned_to', assignedTo)
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            }

            // Lógica especial para incluir vencidas al inicio si no se filtra por status específico
            // o aplicar ordenamiento solicitado
            const { data, count, error } = await query
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(from, to)

            if (error) throw error

            const totalPages = count ? Math.ceil(count / pageSize) : 0

            return {
                data: (data as Task[]) || [],
                count: count || 0,
                page,
                pageSize,
                totalPages,
                hasMore: page < totalPages
            }
        },
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    })
}

export function usePrefetchTasks() {
    const queryClient = useQueryClient()

    return (params: UseTasksParams = {}) => {
        const { page = 1, pageSize = 20 } = params
        const nextPage = page + 1

        return queryClient.prefetchQuery({
            queryKey: ['tasks', { ...params, page: nextPage, pageSize }],
            queryFn: async () => {
                const from = page * pageSize
                const to = from + pageSize - 1

                let query = supabase
                    .from('v_tasks_with_details')
                    .select('*', { count: 'exact' })

                if (params.status) query = query.eq('status', params.status)
                if (params.priority) query = query.eq('priority', params.priority)
                if (params.taskType) query = query.eq('task_type', params.taskType)
                if (params.assignedTo) query = query.eq('assigned_to', params.assignedTo)
                if (params.searchQuery) {
                    query = query.or(`title.ilike.%${params.searchQuery}%,description.ilike.%${params.searchQuery}%`)
                }

                const { data, count, error } = await query
                    .order(params.sortBy || 'due_date', { ascending: params.sortOrder === 'asc' })
                    .range(from, to)

                if (error) throw error

                const totalPages = count ? Math.ceil(count / pageSize) : 0

                return {
                    data: (data as Task[]) || [],
                    count: count || 0,
                    page: nextPage,
                    pageSize,
                    totalPages,
                    hasMore: nextPage < totalPages
                }
            }
        })
    }
}

export function useTask(taskId: string | null) {
    return useQuery<Task | null>({
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
        staleTime: 5 * 60 * 1000
    })
}

export function useTaskMetrics() {
    return useQuery<TaskMetrics>({
        queryKey: ['taskMetrics'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()

            const { data, error } = await supabase
                .from('task_performance_metrics')
                .select('*')
                .eq('user_id', user.id)
                .eq('period_month', month)
                .eq('period_year', year)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            const completionRate = data?.total_tasks_assigned > 0
                ? Math.round((data.tasks_completed / data.total_tasks_assigned) * 100)
                : 0

            return {
                ...data,
                completion_rate: completionRate
            } as TaskMetrics
        },
        staleTime: 60 * 1000,
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()

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
        onMutate: async (newTask) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData(['tasks'])

            queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
                if (!old?.data) return old
                if (old.page === 1) {
                    return {
                        ...old,
                        data: [{ ...newTask, id: 'temp-id', created_at: new Date().toISOString() }, ...old.data].slice(0, old.pageSize),
                        count: (old.count || 0) + 1
                    }
                }
                return old
            })

            return { previousTasks }
        },
        onError: (err, newTask, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['taskMetrics'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            toast.success('Tarea creada exitosamente')
        }
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

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
        onMutate: async ({ taskId, updates }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            await queryClient.cancelQueries({ queryKey: ['task', taskId] })

            queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map((t: Task) =>
                        t.id === taskId ? { ...t, ...updates } : t
                    )
                }
            })
        },
        onSettled: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            if (data) queryClient.invalidateQueries({ queryKey: ['task', data.id] })
        }
    })
}

export function useCompleteTask() {
    const queryClient = useQueryClient()

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
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map((t: Task) =>
                        t.id === taskId ? { ...t, status: 'completada' } : t
                    )
                }
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['taskMetrics'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
    })
}

export function usePostponeTask() {
    const queryClient = useQueryClient()

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
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Tarea pospuesta')
        }
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (taskId: string) => {
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
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.filter((t: Task) => t.id !== taskId),
                    count: (old.count || 0) - 1
                }
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Tarea eliminada')
        }
    })
}

export function useTeamLeaderboard() {
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
        staleTime: 5 * 60 * 1000,
    })
}
