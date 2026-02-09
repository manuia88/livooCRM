/**
 * API Route: Publish Property to External Portals
 *
 * POST /api/publish-property
 * Body: { propertyId: string, portals: string[], action: 'publish' | 'update' | 'unpublish' }
 *
 * Requires authenticated user with access to the property's agency.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { PublicationService } from '@/lib/portals/publication-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, portals, action = 'publish' } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId es requerido' },
        { status: 400 }
      )
    }

    if (action === 'publish' && (!portals || !Array.isArray(portals) || portals.length === 0)) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un portal' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current user and agency
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json(
        { error: 'Usuario no asociado a una agencia' },
        { status: 403 }
      )
    }

    // Verify property belongs to user's agency
    const { data: property } = await supabase
      .from('properties')
      .select('id, agency_id')
      .eq('id', propertyId)
      .eq('agency_id', profile.agency_id)
      .single()

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o sin permisos' },
        { status: 404 }
      )
    }

    // Initialize publication service
    const service = new PublicationService()
    const initialized = await service.initializeForAgency(profile.agency_id)

    if (initialized.length === 0) {
      return NextResponse.json(
        { error: 'No hay portales configurados para tu agencia' },
        { status: 400 }
      )
    }

    // Execute action
    let result

    switch (action) {
      case 'publish':
        result = await service.publishProperty(propertyId, portals, user.id)
        break

      case 'update':
        result = await service.updateProperty(propertyId, user.id)
        break

      case 'unpublish':
        result = await service.unpublishProperty(propertyId, portals, user.id)
        break

      default:
        return NextResponse.json(
          { error: `Acción no válida: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      ...result
    })
  } catch (error: any) {
    console.error('[publish-property] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/publish-property?propertyId=xxx
 * Get publication status for a property across all portals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId es requerido' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get publications for this property
    const { data: publications, error } = await supabase
      .from('property_portals')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Error al consultar publicaciones' },
        { status: 500 }
      )
    }

    // Get recent logs
    const portalIds = (publications || []).map(p => p.id).filter(Boolean)
    let logs: any[] = []

    if (portalIds.length > 0) {
      const { data: logData } = await supabase
        .from('publication_logs')
        .select('*')
        .in('property_portal_id', portalIds)
        .order('created_at', { ascending: false })
        .limit(20)

      logs = logData || []
    }

    return NextResponse.json({
      publications: publications || [],
      logs
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    )
  }
}
