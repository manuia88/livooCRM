# Sistema de Notificaciones en Tiempo Real

## Arquitectura

```
DB Trigger → notifications table → Supabase Realtime (WebSocket) → React Context → Toast
```

## Tipos de Notificaciones

| Tipo | Trigger | Descripción |
|------|---------|-------------|
| `task_assigned` | INSERT tasks | Nueva tarea asignada |
| `task_due_soon` | Cron (cada hora) | Tarea vence en <1h |
| `new_lead` | UPDATE contacts | Nuevo lead asignado |
| `property_update` | UPDATE properties | Cambio de estado |
| `reminder` | Manual | Recordatorio personalizado |
| `mention` | Manual | Mención en comentario |

## Componentes

### NotificationsProvider
Context que maneja estado y Realtime.

### NotificationBell
Dropdown con lista de notificaciones.

### Toast
Notificación temporal (5 segundos).

## Uso

### Configurar en Layout

```tsx
<NotificationsProvider>
  <NotificationBell />
  <Toaster />
</NotificationsProvider>
```

### Crear Notificación Manual

```typescript
await createNotification({
  userId: 'uuid',
  agencyId: 'uuid',
  type: 'reminder',
  title: 'Recordatorio',
  message: 'Llamar a cliente',
  linkUrl: '/backoffice/contactos/123',
  priority: 'high',
  icon: '📞'
})
```

## Prioridades

- **urgent:** Tareas venciendo, emergencias
- **high:** Leads importantes, ventas cerradas
- **normal:** Asignaciones, actualizaciones
- **low:** Informativas

## Performance

- **Realtime:** WebSocket mantiene conexión
- **Lazy loading:** Solo últimas 50 notificaciones
- **Auto-cleanup:** Eliminar después de 30 días (TODO: cron)

## Costo
- **Incluido en Supabase Pro:** $0 adicional
- **Alternativa (Pusher):** $49+/mes

## Triggers de Base de Datos

### 1. Asignación de Tareas
Se activa cuando se asigna una tarea a un usuario.

**Ubicación:** `supabase/migrations/20260210200001_notification_triggers.sql:1-63`

### 2. Asignación de Leads
Se activa cuando se asigna un contacto a un usuario.

**Ubicación:** `supabase/migrations/20260210200001_notification_triggers.sql:65-105`

### 3. Cambio de Estado de Propiedad
Se activa cuando una propiedad cambia de estado.

**Ubicación:** `supabase/migrations/20260210200001_notification_triggers.sql:107-152`

## Archivos Importantes

- `/src/contexts/NotificationsContext.tsx` - Context con Realtime
- `/src/components/notifications/NotificationBell.tsx` - Componente UI
- `/src/hooks/useCreateNotification.ts` - Hook para crear notificaciones
- `/supabase/migrations/20260210200000_notifications.sql` - Schema de BD
- `/supabase/migrations/20260210200001_notification_triggers.sql` - Triggers automáticos

## Métricas de Éxito

- ✅ Notificaciones en <200ms
- ✅ Realtime funciona sin polling
- ✅ Costo: $0 adicional
- ✅ UX: Toast + Bell
