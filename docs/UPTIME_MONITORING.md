# Uptime Monitoring Setup

## Opcion 1: BetterStack (Recomendado)

1. Crear cuenta: https://betterstack.com/uptime
2. Crear monitor:
   - URL: `https://livoo-crm.vercel.app/api/health`
   - Frequency: Every 1 minute
   - Regions: Multiple (US, EU)
   - Alert threshold: 3 consecutive failures

3. Configurar alertas:
   - Email: equipo@livoo.mx
   - Slack: (webhook URL)

## Opcion 2: UptimeRobot

1. Crear cuenta: https://uptimerobot.com
2. Crear monitor:
   - Type: HTTPS
   - URL: `https://livoo-crm.vercel.app/api/health`
   - Interval: 5 minutes
   - Alert contacts: email + Slack

## Endpoints a Monitorear

| Endpoint | Tipo | Prioridad |
|----------|------|-----------|
| `/api/health` | Health Check | Critico |
| `/` | Homepage | Alto |
| `/login` | Autenticacion | Alto |
| `/backoffice` | Dashboard | Medio |

## Alertas Configuradas

- Downtime > 2 minutos
- Response time > 5 segundos
- Status code != 200
- Database connection failed

## Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T12:00:00.000Z",
  "checks": {
    "database": "healthy",
    "api": "healthy"
  },
  "responseTime": "45.23ms",
  "version": "abc123",
  "environment": "production"
}
```

## Dashboard

- BetterStack: https://betterstack.com/team/[team]/uptime
- UptimeRobot: https://dashboard.uptimerobot.com
