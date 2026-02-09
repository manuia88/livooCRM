# Arquitectura del Sistema

## Vista General

```
+-------------------------------------------------------------+
|                        USUARIOS                              |
|  (Agentes, Managers, Admins, Publico)                       |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                   VERCEL EDGE NETWORK                        |
|  (CDN, SSL, DDoS Protection, Rate Limiting)                 |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                    NEXT.JS 16 APP ROUTER                     |
|                                                              |
|  +--------------+  +--------------+  +--------------+       |
|  |   (public)   |  |  (private)   |  |  API Routes  |       |
|  |  Marketing   |  |  Backoffice  |  |  Endpoints   |       |
|  |  Propiedades |  |  CRM/Inbox   |  |  CRUD/Cron   |       |
|  +--------------+  +--------------+  +--------------+       |
|                                                              |
|  +--------------+  +--------------+                          |
|  |   Actions    |  |   Shared     |                          |
|  | Server (RSC) |  | Token routes |                          |
|  +--------------+  +--------------+                          |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                      SUPABASE                                |
|                                                              |
|  +--------------+  +--------------+  +--------------+       |
|  |  PostgreSQL  |  |   Storage    |  |   Realtime   |       |
|  |   (RLS)      |  |   (Images)   |  | (WebSocket)  |       |
|  +--------------+  +--------------+  +--------------+       |
|                                                              |
|  +--------------+  +--------------+                          |
|  |     Auth     |  |    Edge      |                          |
|  |   (JWT)      |  |  Functions   |                          |
|  +--------------+  +--------------+                          |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                   SERVICIOS EXTERNOS                         |
|                                                              |
|  +--------------+  +--------------+  +--------------+       |
|  |  Google Maps |  |   WhatsApp   |  |    Resend    |       |
|  | (Geocoding)  |  |  (Baileys)   |  |   (Email)    |       |
|  +--------------+  +--------------+  +--------------+       |
|                                                              |
|  +--------------+  +--------------+  +--------------+       |
|  |  Google AI   |  |  Langchain   |  | OpenStreetMap|       |
|  |  (Gemini)    |  |  (Chains)    |  |   (Tiles)    |       |
|  +--------------+  +--------------+  +--------------+       |
+-------------------------------------------------------------+
```

## Capas de la Aplicacion

### 1. Presentacion (Frontend)

**Tecnologia:** Next.js 16.1.6 (App Router) + React 19.2.3

**Responsabilidades:**
- Renderizado de componentes (186+ componentes)
- Gestion de estado local y global (Zustand)
- Interaccion con usuario
- Validacion de formularios (React Hook Form + Zod)
- Navegacion y layouts

**Patrones:**
- Server Components (RSC) por defecto
- Client Components solo cuando se necesita interactividad
- Streaming con Suspense
- Optimistic updates con React Query
- Dynamic imports para componentes pesados (Leaflet, Recharts)

**Estructura de rutas:**
```
app/
├── (public)/          # Sin autenticacion
│   ├── propiedades/   # Listado publico, detalle, busqueda
│   ├── mls/           # Multiple Listing Service
│   ├── auth/          # Login, registro, reset password
│   ├── agencias/      # Directorio de agencias
│   ├── contacto/      # Formulario de contacto
│   ├── valuacion/     # Herramienta de valuacion
│   └── blog/          # Contenido educativo
├── (private)/         # Requiere autenticacion
│   ├── backoffice/    # CRM completo
│   └── cortex/        # Asistente AI
├── shared/            # Rutas con token (compartir propiedades)
└── api/               # API endpoints RESTful
```

### 2. Logica de Negocio (Hooks + Services + API Routes)

**Tecnologia:** React Query (TanStack) + Next.js API Routes + Server Actions

**Responsabilidades:**
- Gestion de estado servidor (cache, refetch, invalidation)
- Mutaciones con feedback optimista
- Transformacion de datos
- Validacion de negocio
- Cron jobs automaticos

**Custom Hooks (15):**

| Hook | Responsabilidad |
|------|----------------|
| `useProperties` | CRUD completo de propiedades con filtros |
| `useContacts` | Gestion de contactos y leads |
| `useTasks` | Sistema de tareas, automatizacion |
| `useAnalytics` | Metricas, KPIs, reportes |
| `useDashboard` | Datos del dashboard principal |
| `useConversations` | Mensajeria unificada (WhatsApp, email) |
| `useCurrentUser` | Perfil y permisos del usuario actual |
| `useInfiniteProperties` | Scroll infinito con paginacion |
| `useProducerProfile` | Perfil del agente/productor |
| `useAgencyUsers` | Usuarios de la agencia |
| `useScraping` | Integracion web scraping |
| `useEmailSender` | Envio de emails transaccionales |
| `useCreateNotification` | Creacion de notificaciones |
| `use-toast` | Sistema de toast UI |
| `use-debounce` | Debounce para inputs de busqueda |

**API Routes:**

| Endpoint | Metodos | Descripcion |
|----------|---------|-------------|
| `/api/properties` | GET, POST, PATCH, DELETE | CRUD propiedades |
| `/api/backoffice` | GET | Datos backoffice |
| `/api/whatsapp` | GET, POST | WhatsApp integration |
| `/api/broadcast` | POST | Envios masivos |
| `/api/tasks` | GET, POST, PATCH | Sistema de tareas |
| `/api/tasks/auto-generate` | GET (cron) | Generacion automatica |
| `/api/tasks/check-overdue` | GET (cron) | Verificar vencidas |
| `/api/scraping` | POST | Web scraping |
| `/api/send-email` | POST | Envio de email |
| `/api/geocode` | GET | Geocodificacion |
| `/api/upload` | POST | Subida de archivos |
| `/api/publish-property` | POST | Publicar en portales |
| `/api/seed` | GET | Seed de datos |

### 3. Persistencia (Database)

**Tecnologia:** PostgreSQL via Supabase

**Responsabilidades:**
- Almacenamiento relacional (50+ tablas)
- Autenticacion JWT (Supabase Auth)
- Row Level Security (RLS) multi-tenant
- Real-time subscriptions (WebSocket)
- File storage (imagenes, documentos)
- Funciones y triggers PostgreSQL
- Vistas materializadas para analytics

**Modulos de Base de Datos:**

| Modulo | Tablas | Descripcion |
|--------|--------|-------------|
| Core | 6 | Agencies, profiles, teams, permissions |
| Properties | 6 | Propiedades, documentos, vistas, favoritos |
| Developments | 4 | Proyectos, unidades, planes financieros |
| Owners | 3 | Propietarios y documentos |
| Contacts/Leads | 6 | Leads, interacciones, tags, scoring |
| Communications | 5 | Conversaciones, mensajes, emails, WhatsApp |
| Tasks | 5 | Automatizacion, templates, metricas |
| Visits & Offers | 4 | Agenda, ofertas, transacciones |
| Analytics | 4 | Logs actividad, performance, auditoria |

**Migraciones:** 57+ archivos SQL en `supabase/migrations/`, ejecutados en orden numerico.

### 4. Integraciones (External Services)

| Servicio | Libreria | Patron de Uso |
|----------|----------|---------------|
| Google Maps | `@types/google.maps` | Geocoding de direcciones |
| OpenStreetMap | `react-leaflet` | Tiles de mapa (SSR-safe con dynamic import) |
| WhatsApp Web | `@whiskeysockets/baileys` | Mensajeria directa, QR auth, session persistence |
| Resend | `resend` + `react-email` | Emails transaccionales con templates React |
| Google AI | `@ai-sdk/google` | LLM para asistente Cortex |
| Langchain | `langchain` | Cadenas AI avanzadas |
| Sharp | `sharp` | Procesamiento de imagenes server-side |
| Cheerio | `cheerio` | Web scraping de portales |

## Flujo de Datos

### Lectura (Query)

```
Usuario -> Component -> useQuery Hook -> fetch('/api/...') -> API Route -> Supabase Client -> PostgreSQL
                                                                                                  |
                                                                                           RLS Filter
                                                                                                  |
                                                                                            Response
                                                                                                  |
                                                                              React Query Cache <--+
                                                                                     |
                                                                              Component Re-render
```

### Escritura (Mutation)

```
Usuario -> Form (React Hook Form) -> Zod Validation -> useMutation -> fetch('/api/...') -> API Route
                                                            |                                    |
                                                     Optimistic Update                     Supabase Client
                                                            |                                    |
                                                       UI Update                          PostgreSQL + RLS
                                                            |                                    |
                                                     Query Invalidation <--- Confirm/Error ------+
                                                            |
                                                       Refetch Data
```

### Real-time (Notifications)

```
Database Change -> Trigger -> Supabase Realtime -> WebSocket -> Client Subscription
                                                                        |
                                                                 NotificationsContext
                                                                        |
                                                              Toast / Bell / Badge
```

### Cron Jobs

```
Vercel Cron (vercel.json) -> GET /api/tasks/auto-generate -> Check rules -> Create tasks
                          -> GET /api/tasks/check-overdue  -> Check dates -> Update status + Notify
```

## Seguridad

### Autenticacion

- **Metodo:** JWT (Supabase Auth)
- **Almacenamiento:** HTTP-only cookies via `@supabase/ssr`
- **Refresh:** Automatico
- **Middleware:** `src/lib/auth/middleware.ts` protege rutas `(private)/`
- **Roles:** `admin`, `manager`, `agent` definidos en `profiles.role`

### Autorizacion (Row Level Security)

Todas las tablas usan RLS policies que filtran por `agency_id`:

```sql
-- Ejemplo: SELECT en properties
CREATE POLICY "Users can view own agency properties"
ON properties FOR SELECT
USING (
  agency_id = (
    SELECT agency_id FROM profiles WHERE id = auth.uid()
  )
);
```

Politicas por rol:
- **Admin:** Acceso completo a datos de su agencia
- **Manager:** Lectura completa, escritura con restricciones
- **Agent:** Solo sus propiedades/contactos asignados

Ver [RLS_SECURITY.md](./RLS_SECURITY.md) para detalle completo de policies.

### Headers de Seguridad (next.config.ts)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

### Rate Limiting

- **API Routes:** Custom rate limiter (`src/lib/rate-limit.ts`) por IP
- **Geocoding:** Throttling para respetar limites de APIs externas
- **WhatsApp:** Control de frecuencia de mensajes

## Performance

### Optimizaciones Frontend

- **Code Splitting:** Automatico por ruta (App Router)
- **Dynamic Imports:** Leaflet maps, Recharts (sin SSR)
- **Image Optimization:** Next/Image con formatos AVIF/WebP, cache 1 ano
- **Turbopack:** Habilitado para desarrollo rapido
- **Tree Shaking:** Configurado en next.config.ts para paquetes grandes
- **Bundle Analysis:** `npm run analyze` con @next/bundle-analyzer

### Optimizaciones Backend

- **Indexes:** 100+ indexes en campos de busqueda frecuente
- **Materialized Views:** Para metricas de dashboard
- **Connection Pooling:** Via Supabase Pooler + pg library
- **CDN:** Vercel Edge Network para assets estaticos
- **Cron Jobs:** Tareas pesadas ejecutadas asincrona (vercel.json crons)

### Optimizaciones de Imagenes

- **Sharp:** Procesamiento server-side (resize, formato, calidad)
- **Jimp:** Procesamiento alternativo para formatos especiales
- **WebP/AVIF:** Conversion automatica via Next.js Image
- **Lazy Loading:** Imagenes cargadas bajo demanda
- **CDN Cache:** TTL de 1 ano para imagenes procesadas

### Metricas Objetivo

| Metrica | Objetivo | Descripcion |
|---------|----------|-------------|
| TTFB | <200ms | Time to First Byte |
| FCP | <1.5s | First Contentful Paint |
| LCP | <2.5s | Largest Contentful Paint |
| TTI | <3.5s | Time to Interactive |
| CLS | <0.1 | Cumulative Layout Shift |

## Escalabilidad

### Horizontal

- **Frontend:** Vercel auto-scaling (serverless functions)
- **Database:** Supabase connection pooler (hasta 3000 connections)
- **Storage:** Supabase CDN (distribuido globalmente)
- **API Routes:** Serverless, escalan por demanda

### Vertical

- **Database:** Upgrade plan Supabase segun uso
- **Edge Functions:** Hasta 1GB memoria por funcion
- **Vercel Functions:** Configurable en vercel.json (`maxDuration`)

### Limites Actuales (Free/Pro tier)

| Recurso | Limite | Notas |
|---------|--------|-------|
| Usuarios concurrentes | ~500 | Basado en serverless concurrency |
| Propiedades | ~100K | Sin degradacion con indexes |
| Storage | 1GB (free) / 100GB (pro) | Imagenes y documentos |
| DB Size | 500MB (free) / 8GB (pro) | Con materialized views |
| Requests/dia | ~100K | Vercel hobby tier |

## Disaster Recovery

### Backups

- **Database:** Automatico diario (Supabase)
- **Retention:** 7 dias (free), 30 dias (pro)
- **Point-in-time:** Disponible en plan Pro
- **Codigo:** Git + GitHub (historial completo)

### Rollback

- **Codigo:** Vercel instant rollback a cualquier deployment previo
- **Database:** Supabase PITR (hasta 7 o 30 dias segun plan)
- **Storage:** Versionado disponible en plan Pro

### Estrategia de Recovery

| Escenario | RTO | RPO | Procedimiento |
|-----------|-----|-----|---------------|
| Deploy fallido | <1 min | 0 | Vercel rollback |
| Bug en produccion | <5 min | 0 | Revert commit + deploy |
| Corrupcion DB | <30 min | <24h | Restore backup Supabase |
| Downtime Supabase | N/A | N/A | Dependiente del proveedor |

## Monitoreo

### Stack de Monitoreo

| Herramienta | Uso | Configuracion |
|-------------|-----|---------------|
| Pino | Logging estructurado | `src/lib/monitoring/` |
| Vercel Analytics | Web Vitals, performance | Automatico |
| Vercel Logs | Function logs, errores | `vercel logs` |
| Supabase Dashboard | DB metrics, queries lentas | Dashboard web |

### Metricas Clave

- **Uptime:** Monitoreado via health checks
- **Error Rate:** Logging con Pino, alertas por threshold
- **Response Time:** p95 < 500ms objetivo
- **Database Queries:** p95 < 100ms objetivo

### Health Checks

Endpoint: `GET /api/health` (si configurado)
- Verifica conexion a Supabase
- Verifica auth service
- Retorna status y timestamp

## Decisiones de Arquitectura

### Por que Next.js App Router?

- Server Components reduce JS enviado al cliente
- Streaming mejora perceived performance
- API Routes eliminan necesidad de backend separado
- Vercel deployment es trivial

### Por que Supabase?

- PostgreSQL completo con RLS nativo
- Auth, Storage, Realtime incluidos
- Free tier generoso para MVP
- Elimina necesidad de backend personalizado
- SDK tipado para TypeScript

### Por que React Query?

- Cache inteligente reduce llamadas redundantes
- Optimistic updates mejoran UX
- Background refetch mantiene datos frescos
- Devtools facilitan debugging

### Por que Zustand (no Redux)?

- API minimalista, menos boilerplate
- Compatible con React 19
- Perfecto para estado global ligero (UI state, preferences)
- React Query maneja estado servidor

### Por que Leaflet (no Google Maps)?

- Gratuito y open source (OpenStreetMap tiles)
- Reduce costos operativos significativamente
- Performance comparable para el caso de uso
- Ver [MAPS_MIGRATION.md](./MAPS_MIGRATION.md) para detalle de migracion

### Por que Baileys (no API oficial WhatsApp)?

- Sin costo por mensaje
- Funcionalidad completa (QR, mensajes, media)
- Control total de la sesion
- Trade-off: Requiere session management y reconexion periodica
