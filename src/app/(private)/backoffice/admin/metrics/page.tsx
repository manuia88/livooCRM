'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react'

interface HealthStatus {
  status: string
  timestamp: string
  checks: {
    database: string
    api: string
  }
  responseTime: string
  version: string
  environment: string
}

export default function MetricsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchHealth() {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch health:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500">Cargando metricas...</p>
        </div>
      </div>
    )
  }

  const isHealthy = health?.status === 'healthy'
  const dbHealthy = health?.checks.database === 'healthy'

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-sm text-gray-500">
          Monitoreo en tiempo real del sistema &mdash; Actualizado:{' '}
          {lastRefresh.toLocaleTimeString('es-MX')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            {isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}
            >
              {health?.status || 'unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleString('es-MX')
                : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {dbHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${dbHealthy ? 'text-green-600' : 'text-yellow-600'}`}
            >
              {health?.checks.database || 'unknown'}
            </p>
            <p className="text-xs text-gray-500">Conexion Supabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {health?.checks.api || 'unknown'}
            </p>
            <p className="text-xs text-gray-500">Operacional</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {health?.responseTime || '-'}
            </p>
            <p className="text-xs text-gray-500">Latencia /api/health</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Enlaces de Monitoreo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://vercel.com/dashboard/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Vercel Analytics
            </a>
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Sentry Error Tracking
            </a>
            <a
              href="https://betterstack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Uptime Monitoring
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Version Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Commit:</span>{' '}
              {health?.version || 'dev'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Environment:</span>{' '}
              {health?.environment || 'development'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
