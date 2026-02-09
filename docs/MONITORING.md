# Monitoring & Observability

## Stack de Monitoreo

| Herramienta | Proposito | Costo | Link |
|-------------|-----------|-------|------|
| Sentry | Error tracking | $0 (5K errors/mes) | https://sentry.io |
| Vercel Analytics | Performance | $0 (incluido) | Vercel dashboard |
| BetterStack | Uptime | $0 (10 monitors) | https://betterstack.com |
| Slack | Alertas | $0 | Workspace |

## Setup

### 1. Sentry

```bash
# DSN ya configurado - solo agregar a .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=livoo-crm
SENTRY_AUTH_TOKEN=sntrys_xxx
```

Archivos de configuracion:
- `sentry.client.config.ts` - Config del browser
- `sentry.server.config.ts` - Config del servidor Node.js
- `sentry.edge.config.ts` - Config para edge runtime
- `src/instrumentation.ts` - Inicializacion automatica
- `src/app/global-error.tsx` - Error boundary global con reporte a Sentry

### 2. Vercel Analytics

Automatico - activar en Vercel dashboard. Los componentes `<Analytics />` y `<SpeedInsights />` ya estan integrados en el layout.

### 3. BetterStack

1. Crear cuenta en https://betterstack.com/uptime
2. Agregar monitor: `/api/health`
3. Configurar alertas (ver `docs/UPTIME_MONITORING.md`)

### 4. Slack

1. Crear Incoming Webhook en tu workspace de Slack
2. Agregar URL a secrets: `SLACK_WEBHOOK_URL`

## Uso

### Logger

```typescript
import { logger } from '@/lib/monitoring/logger'

// Logs basicos
logger.info('User logged in', { userId: '123' })
logger.warn('Rate limit approaching', { current: 90, max: 100 })
logger.error('Payment failed', new Error('Card declined'), { orderId: '456' })

// Logs especializados
logger.activity('property_viewed', { propertyId: 'abc', userId: '123' })
logger.security('failed_login', { email: 'user@example.com', ip: '1.2.3.4' })
logger.performance('fetch-properties', 1500, { count: 50 })
```

### Performance Tracking

```typescript
import { measurePerformance } from '@/lib/monitoring/logger'

const result = await measurePerformance('fetch-properties', async () => {
  return await fetchProperties()
})
```

### Alertas Slack

```typescript
import { sendSlackAlert, createErrorAlert } from '@/lib/monitoring/alerts'

await sendSlackAlert(
  process.env.SLACK_WEBHOOK_URL!,
  createErrorAlert(error, { context: 'payment' })
)
```

### Error Boundary

El `ErrorBoundary` component esta disponible para wrappear secciones criticas:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary fallback={<p>Error en esta seccion</p>}>
  <CriticalComponent />
</ErrorBoundary>
```

## Metricas Clave

- **Uptime:** >99.9%
- **Response Time:** <500ms (p95)
- **Error Rate:** <0.1%
- **Apdex Score:** >0.9

## Dashboards

- **Sistema:** `/backoffice/admin/metrics`
- **Vercel:** https://vercel.com/dashboard/analytics
- **Sentry:** https://sentry.io/organizations/[org]/issues/
- **BetterStack:** https://betterstack.com/uptime

## Alertas Configuradas

- Error rate > 1%
- Response time > 2s
- Uptime < 99%
- Database connection failed
- Deployment failed (via webhook)

## API Endpoints

- `GET /api/health` - Health check (usado por uptime monitoring)
- `POST /api/webhooks/vercel-deploy` - Webhook para notificaciones de deploy
