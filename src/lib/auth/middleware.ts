/**
 * Middleware de Autenticación para API Routes
 * 
 * Proporciona helpers para verificar autenticación y autorización
 * en los API routes de Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { AuthenticatedUser } from '@/types'

/**
 * Verifica que el usuario está autenticado
 * 
 * @param request Next.js Request
 * @returns Usuario autenticado o null
 * 
 * @example
 * export async function POST(request: Request) {
 *   const user = await requireAuth(request)
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 *   // Procesar request...
 * }
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Obtener perfil con agency_id y role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('agency_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found for user:', user.id)
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      agency_id: profile.agency_id,
      role: profile.role
    }
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error)
    return null
  }
}

/**
 * Wrapper que requiere autenticación
 * Retorna 401 si el usuario no está autenticado
 * 
 * @param handler Handler que recibe el usuario autenticado
 * @returns Response
 * 
 * @example
 * export const POST = withAuth(async (request, user) => {
 *   // user está garantizado que existe
 *   console.log('User ID:', user.id)
 *   return NextResponse.json({ success: true })
 * })
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access this endpoint'
        },
        { status: 401 }
      )
    }

    return handler(request, user)
  }
}

/**
 * Verifica que el usuario tiene un rol específico
 * 
 * @param user Usuario autenticado
 * @param allowedRoles Roles permitidos
 * @returns true si el usuario tiene uno de los roles permitidos
 * 
 * @example
 * export const POST = withAuth(async (request, user) => {
 *   if (!hasRole(user, ['admin', 'manager'])) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
 *   }
 *   // Procesar request...
 * })
 */
export function hasRole(
  user: AuthenticatedUser,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(user.role)
}

/**
 * Wrapper que requiere un rol específico
 * Retorna 403 si el usuario no tiene el rol necesario
 * 
 * @param allowedRoles Roles permitidos
 * @param handler Handler que recibe el usuario autenticado
 * @returns Response
 * 
 * @example
 * export const POST = withRole(['admin', 'manager'], async (request, user) => {
 *   // Solo admins y managers pueden acceder
 *   return NextResponse.json({ success: true })
 * })
 */
export function withRole(
  allowedRoles: string[],
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse> | NextResponse
) {
  return withAuth(async (request, user) => {
    if (!hasRole(user, allowedRoles)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`
        },
        { status: 403 }
      )
    }

    return handler(request, user)
  })
}

/**
 * Verifica que el request viene del mismo usuario o de un admin
 * Útil para endpoints que modifican datos de un usuario específico
 * 
 * @param user Usuario autenticado
 * @param targetUserId ID del usuario target
 * @returns true si es el mismo usuario o es admin
 * 
 * @example
 * export const PATCH = withAuth(async (request, user) => {
 *   const { userId } = await request.json()
 *   
 *   if (!canAccessUser(user, userId)) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
 *   }
 *   // Actualizar usuario...
 * })
 */
export function canAccessUser(
  user: AuthenticatedUser,
  targetUserId: string
): boolean {
  return user.id === targetUserId || hasRole(user, ['admin', 'manager'])
}

/**
 * Middleware para restringir endpoint solo a desarrollo
 * Útil para endpoints de debug, seed, etc.
 * 
 * @param handler Handler del endpoint
 * @returns Response
 * 
 * @example
 * export const POST = onlyDevelopment(async (request) => {
 *   // Este endpoint solo funciona en desarrollo
 *   return NextResponse.json({ message: 'Seeding database...' })
 * })
 */
export function onlyDevelopment(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'This endpoint is only available in development mode'
        },
        { status: 404 }
      )
    }

    return handler(request)
  }
}

/**
 * Crea un response de error estandarizado
 * 
 * @param message Mensaje de error
 * @param status HTTP status code
 * @param details Detalles adicionales (opcional)
 * @returns NextResponse con el error
 * 
 * @example
 * if (!data) {
 *   return errorResponse('Data not found', 404)
 * }
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details })
    },
    { status }
  )
}

/**
 * Crea un response de éxito estandarizado
 * 
 * @param data Datos a retornar
 * @param message Mensaje opcional
 * @returns NextResponse con los datos
 * 
 * @example
 * return successResponse({ users }, 'Users fetched successfully')
 */
export function successResponse(
  data: any,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    data
  })
}
