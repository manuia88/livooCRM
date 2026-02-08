# Servicio de Emails Transaccionales con Resend

## Costo
- **Free tier:** 100 emails/día, 3,000/mes
- **Costo:** $0/mes
- **Alternativa (SendGrid):** $15+/mes

## Plantillas Disponibles

1. **WelcomeEmail:** Bienvenida a nuevos usuarios
2. **TaskReminderEmail:** Recordatorio de tareas
3. **PasswordResetEmail:** Reset de contraseña (TODO)
4. **WeeklyReportEmail:** Reporte semanal (TODO)

## Uso

### Enviar Email Programáticamente

```typescript
import { sendWelcomeEmail } from '@/lib/email/resend-client'

await sendWelcomeEmail('user@example.com', 'Juan')
```

### Enviar Email desde API

```typescript
await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    email: 'user@example.com',
    firstName: 'Juan'
  })
})
```

### Crear Nueva Plantilla

1. Crear archivo en `src/emails/NuevoEmail.tsx`
2. Usar componentes de `@react-email/components`
3. Agregar helper en `resend-client.ts`
4. Agregar case en API route

## Plantillas Incluidas

### WelcomeEmail

**Archivo:** `/src/emails/WelcomeEmail.tsx`

**Parámetros:**
- `userFirstName`: Nombre del usuario
- `loginUrl`: URL para iniciar sesión

**Uso:**
```typescript
await sendWelcomeEmail('user@example.com', 'Juan')
```

### TaskReminderEmail

**Archivo:** `/src/emails/TaskReminderEmail.tsx`

**Parámetros:**
- `userFirstName`: Nombre del usuario
- `taskTitle`: Título de la tarea
- `taskDescription`: Descripción
- `dueDate`: Fecha de vencimiento
- `taskUrl`: URL de la tarea

**Uso:**
```typescript
await sendTaskReminderEmail('user@example.com', 'Juan', {
  title: 'Llamar a cliente',
  description: 'Seguimiento de propuesta',
  dueDate: '2024-12-31',
  id: 'uuid'
})
```

## Configuración

### Variables de Entorno

```bash
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_APP_URL=https://livoocrm.com
```

### Obtener API Key

1. Crear cuenta en https://resend.com
2. Ir a API Keys
3. Copiar la key y guardar en `.env.local`

## Límites

- **100 emails/día** = ~3 emails/hora
- Suficiente para:
  - 50 usuarios activos
  - Recordatorios críticos
  - Bienvenidas

## Monitoreo

Dashboard de Resend: https://resend.com/dashboard
- Ver emails enviados
- Tracking de entregas
- Bounces y errores

## Troubleshooting

### Email no llega
- Verificar API key
- Revisar logs en Resend dashboard
- Verificar dominio verificado

### Límite excedido
- Upgrade a plan de pago: $20/mes (50K emails)

## Archivos Importantes

- `/src/lib/email/resend-client.ts` - Cliente de Resend
- `/src/emails/WelcomeEmail.tsx` - Plantilla de bienvenida
- `/src/emails/TaskReminderEmail.tsx` - Plantilla de recordatorio
- `/src/app/api/send-email/route.ts` - API route para emails

## Integración con Triggers

Para enviar emails automáticamente desde triggers de base de datos, se puede llamar al API route desde una función de PostgreSQL usando `pg_net` o crear un webhook.

**Ejemplo:**

```sql
-- Llamar API desde trigger
PERFORM net.http_post(
  url := 'https://livoocrm.com/api/send-email',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := json_build_object(
    'type', 'task_reminder',
    'email', user_email,
    'firstName', user_name,
    'task', json_build_object(...)
  )::jsonb
);
```

## Métricas de Éxito

- ✅ Emails enviados en <5 segundos
- ✅ Free tier suficiente
- ✅ Costo: $0/mes
- ✅ Plantillas profesionales
