/**
 * Supabase Server Admin Client
 * 
 * Cliente de Supabase con SERVICE_ROLE_KEY para operaciones administrativas.
 * Este cliente SOLO debe usarse en el servidor (API routes, server components).
 * 
 * SEGURIDAD: Valida que la SERVICE_ROLE_KEY existe. Si no está configurada,
 * lanza un error explícito en lugar de fallar silenciosamente.
 * 
 * USO:
 * import { createServerAdminClient } from '@/lib/supabase/server-admin'
 * const supabase = createServerAdminClient()
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let serverAdminClient: SupabaseClient | null = null

/**
 * Valida que las variables de entorno necesarias están configuradas
 * @throws {Error} Si faltan variables requeridas
 */
function validateServerConfig(): { url: string; serviceKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Validar URL
  if (!url) {
    throw new Error(
      '❌ SUPABASE_URL no está configurada.\n' +
      'Agrega NEXT_PUBLIC_SUPABASE_URL a tu archivo .env.local'
    )
  }

  // Validar SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY no está configurada.\n' +
      'Esta variable es REQUERIDA para operaciones administrativas.\n' +
      'Encuentra tu service_role key en:\n' +
      'Supabase Dashboard → Settings → API → service_role key\n\n' +
      '⚠️  IMPORTANTE: Esta key es SECRETA y solo debe usarse en el servidor.\n' +
      '⚠️  NUNCA la expongas en el código del cliente o en variables NEXT_PUBLIC_*'
    )
  }

  // Validar que no sea el anon key (error común)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (serviceKey === anonKey) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY está configurada con el anon key.\n' +
      'La SERVICE_ROLE_KEY y el ANON_KEY son diferentes.\n' +
      'Verifica tu configuración en Supabase Dashboard → Settings → API'
    )
  }

  return { url, serviceKey }
}

/**
 * Crea un cliente de Supabase con SERVICE_ROLE_KEY
 * 
 * Este cliente tiene permisos administrativos y bypasses RLS.
 * SOLO usar en servidor para operaciones que requieren acceso completo.
 * 
 * @returns {SupabaseClient} Cliente de Supabase con privilegios admin
 * @throws {Error} Si las variables de entorno no están configuradas
 * 
 * @example
 * // En un API route
 * import { createServerAdminClient } from '@/lib/supabase/server-admin'
 * 
 * export async function POST(request: Request) {
 *   const supabase = createServerAdminClient()
 *   
 *   // Este cliente puede hacer operaciones que bypasses RLS
 *   const { data } = await supabase.from('users').select('*')
 *   return Response.json(data)
 * }
 */
export function createServerAdminClient(): SupabaseClient {
  // En desarrollo, validar en cada llamada para detectar errores rápido
  // En producción, validar solo una vez y cachear el cliente
  if (process.env.NODE_ENV === 'production' && serverAdminClient) {
    return serverAdminClient
  }

  const { url, serviceKey } = validateServerConfig()

  const client = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  if (process.env.NODE_ENV === 'production') {
    serverAdminClient = client
  }

  return client
}

/**
 * Verifica si el código está ejecutándose en el servidor
 * @returns {boolean} true si está en el servidor
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * Wrapper seguro que valida que el código se ejecuta en el servidor
 * 
 * @param fn Función a ejecutar
 * @returns Resultado de la función
 * @throws {Error} Si se intenta ejecutar en el cliente
 * 
 * @example
 * import { runOnServer } from '@/lib/supabase/server-admin'
 * 
 * export const getServerData = runOnServer(async () => {
 *   const supabase = createServerAdminClient()
 *   return await supabase.from('users').select('*')
 * })
 */
export function runOnServer<T>(fn: () => T): T {
  if (!isServer()) {
    throw new Error(
      '❌ Intento de ejecutar función de servidor en el cliente.\n' +
      'createServerAdminClient() solo puede usarse en:\n' +
      '- API Routes (app/api/**/route.ts)\n' +
      '- Server Components (async components sin "use client")\n' +
      '- Server Actions (funciones con "use server")'
    )
  }

  return fn()
}

/**
 * Helper para validar configuración en build time
 * Útil para CI/CD para detectar variables faltantes antes de deploy
 */
export function validateSupabaseConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar URL
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }

  // Validar ANON KEY
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
  }

  // Validar SERVICE_ROLE_KEY
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }

  // Validar que SERVICE_ROLE_KEY no sea el ANON_KEY
  if (
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY no puede ser igual al ANON_KEY')
  }

  // Validar NODE_ENV en producción
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      warnings.push('SUPABASE_URL apunta a localhost en producción')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
