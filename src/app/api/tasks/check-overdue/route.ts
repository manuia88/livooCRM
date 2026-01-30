// /app/api/tasks/check-overdue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * API Route: Marcar tareas vencidas
 * 
 * Esta función se ejecuta cada 30 minutos para:
 * 1. Encontrar tareas pendientes con due_date pasada
 * 2. Cambiar su status a 'vencida'
 * 
 * Endpoint: POST /api/tasks/check-overdue
 */

export async function POST(request: NextRequest) {
    try {
        // Verificar autorización
        const authHeader = request.headers.get('authorization')
        const apiKey = process.env.CRON_SECRET

        if (authHeader !== `Bearer ${apiKey}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = await createClient()

        // Buscar tareas vencidas
        const { data: overdueTasks, error: findError } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        due_date,
        assigned_to
      `)
            .eq('status', 'pendiente')
            .lt('due_date', new Date().toISOString())
            .is('deleted_at', null)

        if (findError) throw findError

        // Actualizar a vencida
        if (overdueTasks && overdueTasks.length > 0) {
            const { error: updateError } = await supabase
                .from('tasks')
                .update({ status: 'vencida' })
                .in('id', overdueTasks.map(t => t.id))

            if (updateError) throw updateError
        }

        // Registrar en log
        await supabase.from('task_auto_generation_log').insert({
            execution_type: 'check_overdue',
            tasks_affected: overdueTasks?.length || 0,
            success: true,
            details: {
                tasks_marked: overdueTasks?.length || 0
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Overdue tasks marked',
            tasks_marked: overdueTasks?.length || 0,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Check overdue error:', error)

        // Registrar error en log
        const supabase = await createClient()
        await supabase.from('task_auto_generation_log').insert({
            execution_type: 'check_overdue',
            tasks_affected: 0,
            success: false,
            error_message: error.message
        })

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}
