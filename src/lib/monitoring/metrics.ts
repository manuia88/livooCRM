/**
 * Sistema de Métricas y Monitoring
 * 
 * Recopila métricas de performance, uso y errores
 * para monitoring y debugging.
 */

interface Metric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Metric[] = []
  private maxMetrics = 1000 // Límite en memoria

  /**
   * Registra una métrica
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Mantener límite de memoria
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // En producción, enviar a servicio externo
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(metric)
    }
  }

  /**
   * Incrementa un contador
   */
  increment(name: string, tags?: Record<string, string>): void {
    this.record(name, 1, tags)
  }

  /**
   * Registra una duración (ms)
   */
  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.record(`${name}.duration`, durationMs, tags)
  }

  /**
   * Registra un gauge (valor actual)
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(`${name}.gauge`, value, tags)
  }

  /**
   * Obtiene métricas recientes
   */
  getRecentMetrics(limit = 100): Metric[] {
    return this.metrics.slice(-limit)
  }

  /**
   * Obtiene métricas por nombre
   */
  getMetricsByName(name: string): Metric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Calcula estadísticas de una métrica
   */
  getStats(name: string): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
  } | null {
    const metrics = this.getMetricsByName(name)
    
    if (metrics.length === 0) return null

    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: metrics.length,
      sum,
      avg: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  /**
   * Limpia métricas antiguas
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Envía métricas a servicio externo
   */
  private sendToMonitoring(metric: Metric): void {
    // TODO: Integrar con servicio de métricas
    // - Vercel Analytics
    // - Datadog
    // - New Relic
    // - CloudWatch
  }
}

// Export singleton
export const metrics = new MetricsCollector()

/**
 * Métricas predefinidas para tracking común
 */
export const MetricNames = {
  // API
  API_REQUEST: 'api.request',
  API_ERROR: 'api.error',
  API_LATENCY: 'api.latency',
  
  // Auth
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  
  // WhatsApp
  WHATSAPP_MESSAGE_SENT: 'whatsapp.message.sent',
  WHATSAPP_MESSAGE_FAILED: 'whatsapp.message.failed',
  WHATSAPP_CONNECTED: 'whatsapp.connected',
  WHATSAPP_DISCONNECTED: 'whatsapp.disconnected',
  
  // Broadcast
  BROADCAST_CREATED: 'broadcast.created',
  BROADCAST_COMPLETED: 'broadcast.completed',
  BROADCAST_FAILED: 'broadcast.failed',
  
  // Database
  DB_QUERY: 'db.query',
  DB_ERROR: 'db.error',
  
  // Rate Limit
  RATE_LIMIT_HIT: 'rate_limit.hit',
  
  // Performance
  PAGE_LOAD: 'page.load',
  API_RESPONSE_TIME: 'api.response_time',
} as const

/**
 * Helper para tracking de requests
 */
export function trackRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  durationMs: number
): void {
  metrics.timing(MetricNames.API_LATENCY, durationMs, {
    endpoint,
    method,
    status: statusCode.toString()
  })

  metrics.increment(MetricNames.API_REQUEST, {
    endpoint,
    method,
    status: statusCode.toString()
  })

  if (statusCode >= 400) {
    metrics.increment(MetricNames.API_ERROR, {
      endpoint,
      method,
      status: statusCode.toString()
    })
  }
}

/**
 * Helper para tracking de errores
 */
export function trackError(
  errorType: string,
  message: string,
  metadata?: Record<string, string>
): void {
  metrics.increment(`error.${errorType}`, metadata)
}
