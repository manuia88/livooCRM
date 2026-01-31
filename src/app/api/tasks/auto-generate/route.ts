// /app/api/tasks/auto-generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * API Route: Auto-generar tareas basadas en reglas
 * 
 * Esta función se ejecuta periódicamente (cada hora) para:
 * 1. Detectar clientes sin interacción
 * 2. Detectar propiedades con health score bajo
 * 3. Generar tareas automáticamente
 * 
 * Endpoint: POST /api/tasks/auto-generate
 * Auth: Requiere API key (para cron jobs)
 */

export async function POST(request: NextRequest) {
    try {
        // Verificar autorización (API key para cron jobs)
        const authHeader = request.headers.get('authorization')
        const apiKey = process.env.CRON_SECRET

        if (authHeader !== `Bearer ${apiKey}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = await createClient()
        const results = {
            client_followup_tasks: 0,
            property_improvement_tasks: 0,
            errors: [] as string[]
        }

        // ========================================================================
        // REGLA 1: Clientes sin interacción (2+ días)
        // ========================================================================
        try {
            // Buscar contactos sin interacción reciente
            const { data: inactiveContacts, error: contactsError } = await supabase
                .rpc('find_contacts_without_interaction', {
                    days_threshold: 2
                })

            if (contactsError) throw contactsError

            // Generar tarea para cada contacto inactivo
            for (const contact of inactiveContacts || []) {
                const { data: taskExists } = await supabase
                    .from('tasks')
                    .select('id')
                    .eq('contact_id', contact.id)
                    .eq('task_type', 'follow_up')
                    .eq('status', 'pendiente')
                    .maybeSingle()

                // Solo crear si no existe tarea pendiente
                if (!taskExists) {
                    const { error: taskError } = await supabase
                        .from('tasks')
                        .insert({
                            agency_id: contact.agency_id,
                            assigned_to: contact.assigned_to || await getDefaultUser(),
                            task_type: 'follow_up',
                            contact_id: contact.id,
                            title: `Seguimiento: ${contact.first_name} ${contact.last_name || ''}`,
                            description: `Cliente sin contacto por ${contact.days_since_last_interaction} días. Realizar seguimiento.`,
                            priority: 'media',
                            is_auto_generated: true,
                            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
                        })

                    if (taskError) {
                        results.errors.push(`Contact ${contact.id}: ${taskError.message}`)
                    } else {
                        results.client_followup_tasks++
                    }
                }
            }
        } catch (error: any) {
            results.errors.push(`Client followup: ${error.message}`)
        }

        // ========================================================================
        // REGLA 2: Propiedades con health score bajo (<60%)
        // ========================================================================
        try {
            const { data: lowScoreProperties, error: propertiesError } = await supabase
                .from('properties')
                .select('*')
                .lt('health_score', 60)
                .eq('status', 'active')

            if (propertiesError) throw propertiesError

            for (const property of lowScoreProperties || []) {
                // Verificar si ya existe tarea
                const { data: taskExists } = await supabase
                    .from('tasks')
                    .select('id')
                    .eq('property_id', property.id)
                    .eq('task_type', 'review')
                    .eq('status', 'pendiente')
                    .maybeSingle()

                if (!taskExists) {
                    // Determinar qué falta para mejorar el score
                    const suggestions = []
                    if ((property.photos?.length || 0) < 10) suggestions.push('Subir más fotos (+20 pts)')
                    if (!property.virtual_tour_url) suggestions.push('Agregar tour 360° (+15 pts)')
                    if (!property.floor_plan_url) suggestions.push('Agregar planos (+10 pts)')

                    const { error: taskError } = await supabase
                        .from('tasks')
                        .insert({
                            agency_id: property.agency_id,
                            assigned_to: property.assigned_to || await getDefaultUser(),
                            task_type: 'review',
                            property_id: property.id,
                            title: `Mejorar calidad: ${property.title}`,
                            description: `Health score: ${property.health_score}%. Sugerencias:\n${suggestions.join('\n')}`,
                            priority: 'baja',
                            is_auto_generated: true,
                            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
                        })

                    if (taskError) {
                        results.errors.push(`Property ${property.id}: ${taskError.message}`)
                    } else {
                        results.property_improvement_tasks++
                    }
                }
            }
        } catch (error: any) {
            results.errors.push(`Property improvement: ${error.message}`)
        }

        // Registrar en log
        await supabase.from('task_auto_generation_log').insert({
            execution_type: 'auto_generation',
            tasks_affected: results.client_followup_tasks + results.property_improvement_tasks,
            success: results.errors.length === 0,
            error_message: results.errors.join('; ') || null,
            details: results
        })

        // ========================================================================
        // RESULTADO
        // ========================================================================
        return NextResponse.json({
            success: true,
            message: 'Auto-generation completed',
            results: {
                total_tasks_created:
                    results.client_followup_tasks +
                    results.property_improvement_tasks,
                breakdown: {
                    client_followup: results.client_followup_tasks,
                    property_improvement: results.property_improvement_tasks
                },
                errors: results.errors
            },
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Auto-generation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        )
    }
}

async function getDefaultUser() {
    const supabase = await createClient()
    const { data } = await supabase.from('user_profiles').select('id').limit(1).single()
    return data?.id || null
}
