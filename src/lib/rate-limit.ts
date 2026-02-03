/**
 * Rate Limiting Middleware
 * 
 * Sistema de rate limiting simple basado en memoria
 * para proteger endpoints contra abuso.
 * 
 * NOTA: Para producción con múltiples instancias,
 * considera usar Redis o Upstash Rate Limit.
 */

import { NextResponse } from 'next/server'
import { logger, metrics } from '@/lib/monitoring'

interface RateLimitOptions {
  /**
   * Intervalo de tiempo en milisegundos
   * @default 60000 (1 minuto)
   */
  interval?: number

  /**
   * Número máximo de requests en el intervalo
   * @default 10
   */
  maxRequests?: number

  /**
   * Identificador único del endpoint
   * Usado para separar límites entre endpoints
   */
  uniqueTokenPerInterval?: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Store en memoria (simple, para desarrollo)
// En producción usar Redis/Upstash
const store = new Map<string, RateLimitRecord>()

/**
 * Limpia registros expirados cada 5 minutos
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Obtiene un identificador único para el request
 * Usa IP + user agent como identificador
 */
function getIdentifier(request: Request): string {
  // Intentar obtener IP real
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  // Agregar user agent para más precisión
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}-${userAgent.substring(0, 50)}`
}

/**
 * Middleware de rate limiting
 * 
 * @param options Configuración del rate limit
 * @returns NextResponse con 429 si excede el límite, o null si está OK
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    interval = 60000, // 1 minuto
    maxRequests = 10,
    uniqueTokenPerInterval = 500
  } = options

  return async (request: Request): Promise<NextResponse | null> => {
    const identifier = getIdentifier(request)
    const now = Date.now()
    
    // Crear key única por endpoint e identificador
    const endpoint = new URL(request.url).pathname
    const key = `${endpoint}:${identifier}`

    // Obtener o crear registro
    let record = store.get(key)

    if (!record || now > record.resetTime) {
      // Crear nuevo registro
      record = {
        count: 1,
        resetTime: now + interval
      }
      store.set(key, record)
    } else {
      // Incrementar contador
      record.count++

      // Verificar si excede el límite
      if (record.count > maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)
        
        // Log rate limit hit
        logger.security('Rate limit exceeded', {
          endpoint,
          identifier: identifier.substring(0, 30), // Truncar para privacidad
          maxRequests,
          retryAfter
        })
        
        // Track metric
        metrics.increment('rate_limit.hit', {
          endpoint
        })
        
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
            }
          }
        )
      }
    }

    // Rate limit OK, retornar null para continuar
    return null
  }
}

/**
 * Higher-order function para aplicar rate limiting a un handler
 * 
 * @example
 * export const POST = withRateLimit(
 *   { maxRequests: 5, interval: 60000 },
 *   async (request) => {
 *     // Handler protegido
 *   }
 * )
 */
export function withRateLimit<T extends any[]>(
  options: RateLimitOptions,
  handler: (...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    // El primer argumento debe ser el request
    const request = args[0] as unknown as Request

    // Aplicar rate limit
    const rateLimitResponse = await rateLimit(options)(request)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Si pasa rate limit, ejecutar handler
    return handler(...args)
  }
}

/**
 * Configuraciones predefinidas de rate limiting
 */
export const RateLimitPresets = {
  /**
   * Muy estricto: 5 req/min
   * Para endpoints críticos como envío de emails
   */
  strict: {
    maxRequests: 5,
    interval: 60000
  },

  /**
   * Estándar: 10 req/min
   * Para endpoints normales de API
   */
  standard: {
    maxRequests: 10,
    interval: 60000
  },

  /**
   * Moderado: 30 req/min
   * Para endpoints de lectura
   */
  moderate: {
    maxRequests: 30,
    interval: 60000
  },

  /**
   * Relajado: 60 req/min
   * Para endpoints públicos
   */
  relaxed: {
    maxRequests: 60,
    interval: 60000
  }
} as const
