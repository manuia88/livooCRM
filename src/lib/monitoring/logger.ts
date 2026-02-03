/**
 * Sistema de Logging Estructurado
 * 
 * Proporciona logging consistente con niveles de severidad
 * y metadata estructurada para debugging y monitoring.
 * 
 * En producción, estos logs pueden enviarse a servicios como:
 * - Sentry (error tracking)
 * - LogRocket (session replay)
 * - Datadog (metrics & logs)
 * - Vercel Analytics
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogMetadata {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: LogMetadata
  userId?: string
  agencyId?: string
  requestId?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  /**
   * Formatea y emite un log
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // En tests, silenciar logs
    if (this.isTest && level !== 'error' && level !== 'fatal') {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    }

    // Agregar context si está disponible
    if (metadata?.userId) entry.userId = metadata.userId
    if (metadata?.agencyId) entry.agencyId = metadata.agencyId
    if (metadata?.requestId) entry.requestId = metadata.requestId

    // En desarrollo: logs legibles
    if (this.isDevelopment) {
      this.logToConsole(entry)
    } else {
      // En producción: JSON estructurado
      this.logAsJSON(entry)
    }

    // Si es error o fatal, enviar a servicio externo
    if (level === 'error' || level === 'fatal') {
      this.sendToErrorTracking(entry)
    }
  }

  /**
   * Log formato console (desarrollo)
   */
  private logToConsole(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level)
    const color = this.getLevelColor(entry.level)
    
    const prefix = `${emoji} [${entry.level.toUpperCase()}]`
    const time = new Date(entry.timestamp).toLocaleTimeString()
    
    console.log(`${prefix} ${time}`, entry.message)
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('  📎 Metadata:', entry.metadata)
    }
    
    if (entry.error) {
      console.error('  ❌ Error:', entry.error.message)
      if (entry.error.stack) {
        console.error(entry.error.stack)
      }
    }
  }

  /**
   * Log formato JSON (producción)
   */
  private logAsJSON(entry: LogEntry): void {
    console.log(JSON.stringify(entry))
  }

  /**
   * Envía errores a servicio externo
   * TODO: Integrar con Sentry, LogRocket, etc.
   */
  private sendToErrorTracking(entry: LogEntry): void {
    // En producción, enviar a Sentry u otro servicio
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar con Sentry
      // Sentry.captureException(entry.error, {
      //   level: entry.level,
      //   extra: entry.metadata
      // })
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍'
      case 'info': return 'ℹ️'
      case 'warn': return '⚠️'
      case 'error': return '❌'
      case 'fatal': return '💥'
      default: return '📝'
    }
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '\x1b[36m' // Cyan
      case 'info': return '\x1b[32m'  // Green
      case 'warn': return '\x1b[33m'  // Yellow
      case 'error': return '\x1b[31m' // Red
      case 'fatal': return '\x1b[35m' // Magenta
      default: return '\x1b[0m'       // Reset
    }
  }

  /**
   * Debug: Solo en desarrollo
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      this.log('debug', message, metadata)
    }
  }

  /**
   * Info: Información general
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata)
  }

  /**
   * Warn: Advertencias que no bloquean
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata)
  }

  /**
   * Error: Errores que requieren atención
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    const entry = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }
    this.log('error', message, entry)
  }

  /**
   * Fatal: Errores críticos del sistema
   */
  fatal(message: string, error?: Error, metadata?: LogMetadata): void {
    const entry = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }
    this.log('fatal', message, entry)
  }

  /**
   * Log de actividad de usuario
   */
  activity(action: string, metadata: LogMetadata): void {
    this.info(`User Activity: ${action}`, {
      ...metadata,
      type: 'user_activity'
    })
  }

  /**
   * Log de eventos de seguridad
   */
  security(event: string, metadata: LogMetadata): void {
    this.warn(`Security Event: ${event}`, {
      ...metadata,
      type: 'security'
    })
  }

  /**
   * Log de performance
   */
  performance(operation: string, durationMs: number, metadata?: LogMetadata): void {
    const level: LogLevel = durationMs > 1000 ? 'warn' : 'info'
    this.log(level, `Performance: ${operation} took ${durationMs}ms`, {
      ...metadata,
      type: 'performance',
      duration: durationMs
    })
  }
}

// Export singleton
export const logger = new Logger()

/**
 * Helper para medir performance de funciones
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: LogMetadata
): Promise<T> {
  const start = Date.now()
  
  try {
    const result = await fn()
    const duration = Date.now() - start
    
    logger.performance(operation, duration, metadata)
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    
    logger.error(
      `Operation "${operation}" failed after ${duration}ms`,
      error as Error,
      metadata
    )
    
    throw error
  }
}

/**
 * Helper para crear child logger con context
 */
export function createChildLogger(context: LogMetadata) {
  return {
    debug: (message: string, meta?: LogMetadata) => 
      logger.debug(message, { ...context, ...meta }),
    info: (message: string, meta?: LogMetadata) => 
      logger.info(message, { ...context, ...meta }),
    warn: (message: string, meta?: LogMetadata) => 
      logger.warn(message, { ...context, ...meta }),
    error: (message: string, error?: Error, meta?: LogMetadata) => 
      logger.error(message, error, { ...context, ...meta }),
    fatal: (message: string, error?: Error, meta?: LogMetadata) => 
      logger.fatal(message, error, { ...context, ...meta }),
    activity: (action: string, meta?: LogMetadata) => 
      logger.activity(action, { ...context, ...meta }),
    security: (event: string, meta?: LogMetadata) => 
      logger.security(event, { ...context, ...meta }),
  }
}
