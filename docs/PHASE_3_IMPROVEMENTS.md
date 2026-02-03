# 🚀 Fase 3: Mejoras Arquitectónicas

Este documento describe las mejoras arquitectónicas implementadas para mejorar la mantenibilidad, escalabilidad y robustez del código.

## 📋 Índice

1. [Consolidación de Tipos TypeScript](#1-consolidación-de-tipos-typescript)
2. [WhatsApp Session Persistence](#2-whatsapp-session-persistence)
3. [Próximas Mejoras](#3-próximas-mejoras)

---

## ✅ 1. Consolidación de Tipos TypeScript

### Problema

- **Tipos fragmentados** en 8+ archivos diferentes
- **Duplicación** de tipos para propiedades (property.ts, properties.ts, property-types.ts, property-extended.ts)
- **Inconsistencias** entre tipos y estructura real de BD
- **Imports complicados** desde múltiples archivos

### Solución Implementada

**Archivo Maestro:** `src/types/database.ts`

Contiene TODOS los tipos del sistema organizados en secciones:

#### **1. Enums y Constantes**
```typescript
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer'
export type PropertyType = 'casa' | 'departamento' | 'terreno' | ...
export type OperationType = 'sale' | 'rent' | 'both'
export type PropertyStatus = 'draft' | 'active' | 'sold' | ...
```

#### **2. Tablas Core**
```typescript
export interface Agency { ... }
export interface UserProfile { ... }
export interface CurrentUser extends UserProfile { ... }
```

#### **3. Tablas de Negocio**
```typescript
export interface Property { ... }
export interface PropertyWithRelations extends Property { ... }
export interface Contact { ... }
export interface Task { ... }
export interface Broadcast { ... }
```

#### **4. Tipos para Vistas y RPC**
```typescript
export interface DashboardSummary { ... }
export interface AgencyMetrics { ... }
export interface AgentMetrics { ... }
```

#### **5. Tipos Helper**
```typescript
export interface PaginationParams { ... }
export interface PropertyFilters { ... }
export interface ContactFilters { ... }
export interface ApiResponse<T> { ... }
```

#### **6. Formularios (Wizard)**
```typescript
export interface PropertyFormStep1 { ... }
export interface PropertyFormStep2 { ... }
// ... hasta Step7
```

### Archivo Índice

**Archivo:** `src/types/index.ts`

```typescript
// Punto de entrada único
export * from './database'
export * from './inbox'
export * from './templates'
export * from './analytics'
export * from './broadcast'
```

### Uso

**Antes (Problemático):**
```typescript
import { Property } from '@/types/property'
import { Contact } from '@/types/contact'
import { UserProfile } from '@/hooks/useCurrentUser'
```

**Ahora (Limpio):**
```typescript
import type { Property, Contact, UserProfile } from '@/types'
```

### Archivos Actualizados

- ✅ `src/hooks/useCurrentUser.ts` - Ahora usa `CurrentUser` de `@/types`
- ✅ `src/lib/auth/middleware.ts` - Ahora usa `AuthenticatedUser` de `@/types`

### Beneficios

1. ✅ **Single Source of Truth** - Un solo lugar para todos los tipos
2. ✅ **Mejor DX** - Imports más simples
3. ✅ **Type Safety** - Tipos coinciden con estructura real de BD
4. ✅ **Mantenibilidad** - Fácil encontrar y actualizar tipos
5. ✅ **No Duplicación** - Tipos únicos, reutilizables

---

## ✅ 2. WhatsApp Session Persistence

### Problema Crítico

**Antes:**
- Sesión guardada en **filesystem local** (`whatsapp-auth-session/`)
- Se **pierde en cada deployment** en Vercel
- **Cold starts** requieren re-escanear QR
- **No compatible** con arquitectura serverless

**Impacto:**
- Interrupciones constantes del servicio
- Mala experiencia de usuario
- Necesidad de re-autenticar frecuentemente

### Solución Implementada

**Archivo:** `src/lib/whatsapp/supabase-auth-state.ts`

Adaptador que reemplaza `useMultiFileAuthState` de Baileys con persistencia en Supabase Storage.

#### Funciones Principales

```typescript
/**
 * Crea auth state con Supabase Storage
 */
export async function useSupabaseAuthState(
  supabase: SupabaseClient,
  options: { bucketName: string; folderPath?: string }
): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }>

/**
 * Asegura que el bucket existe
 */
export async function ensureWhatsAppBucket(
  supabase: SupabaseClient,
  bucketName: string
): Promise<void>

/**
 * Limpia la sesión (logout/reset)
 */
export async function clearWhatsAppSession(
  supabase: SupabaseClient,
  options: { bucketName: string; folderPath?: string }
): Promise<void>
```

#### Características

1. **Persistencia en Supabase Storage**
   - Archivos JSON en bucket privado
   - Estructura compatible con Baileys
   - Upsert automático (no conflictos)

2. **Compatibilidad con Serverless**
   - No depende de filesystem
   - Funciona en Vercel Edge Functions
   - Sin cold start issues

3. **Modo Híbrido**
   ```typescript
   const USE_SUPABASE_STORAGE = process.env.NODE_ENV === 'production'
   
   if (USE_SUPABASE_STORAGE) {
     // Usar Supabase Storage (producción)
   } else {
     // Usar filesystem local (desarrollo)
   }
   ```

4. **Bucket Privado**
   - `public: false`
   - Solo accesible con SERVICE_ROLE_KEY
   - Limit de 10MB por archivo

### Estructura del Storage

```
whatsapp-sessions/
└── session/
    ├── creds.json              # Credenciales principales
    └── keys/
        ├── app-state-sync-key-{id}.json
        ├── pre-key-{id}.json
        ├── sender-key-{id}.json
        └── session-{id}.json
```

### Actualización del Servicio

**Archivo:** `src/lib/whatsapp/service.ts`

```typescript
async connect(): Promise<{ qr?: string; status: string }> {
  let state, saveCreds;
  
  if (USE_SUPABASE_STORAGE) {
    console.log('🔐 Usando Supabase Storage para sesión de WhatsApp');
    
    await ensureWhatsAppBucket(this.supabase, STORAGE_BUCKET);
    
    const authState = await useSupabaseAuthState(this.supabase, {
      bucketName: STORAGE_BUCKET,
      folderPath: 'session'
    });
    
    state = authState.state;
    saveCreds = authState.saveCreds;
  } else {
    console.log('📁 Usando filesystem local (desarrollo)');
    
    const authState = await useMultiFileAuthState(SESSION_DIR);
    state = authState.state;
    saveCreds = authState.saveCreds;
  }
  
  // ... resto del código
}
```

### Configuración

**Variables de Entorno:**
```bash
# .env.local (desarrollo) - usa filesystem
NODE_ENV=development

# .env.production (producción) - usa Supabase Storage
NODE_ENV=production
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Crear Bucket en Supabase:**

El bucket se crea automáticamente la primera vez que se conecta WhatsApp en producción. También puedes crearlo manualmente:

```sql
-- En Supabase Dashboard → Storage → Create Bucket
Name: whatsapp-sessions
Public: false
File size limit: 10 MB
Allowed MIME types: application/json
```

### Beneficios

1. ✅ **Persistencia Real** - Sesión sobrevive a deployments
2. ✅ **Sin Re-autenticación** - No más escaneo de QR constante
3. ✅ **Serverless Compatible** - Funciona en Vercel/Edge Functions
4. ✅ **Modo Desarrollo** - Filesystem local para testing rápido
5. ✅ **Seguridad** - Bucket privado, solo SERVICE_ROLE_KEY
6. ✅ **Cleanup Fácil** - Función para limpiar sesión

### Testing

```typescript
// Conectar (primera vez, generará QR)
await whatsAppService.connect()

// Escanear QR con WhatsApp

// Después de escanear, la sesión se guarda automáticamente en Storage

// Siguiente deployment/cold start
await whatsAppService.connect() // ✅ Conecta automáticamente sin QR
```

### Migración

**Para usuarios existentes con sesión local:**

1. La sesión local seguirá funcionando en desarrollo
2. En producción (primer deploy), se pedirá escanear QR una vez
3. Después de eso, la sesión persiste en Supabase Storage

**Para limpiar sesión:**

```typescript
import { clearWhatsAppSession } from '@/lib/whatsapp/supabase-auth-state'
import { createServerAdminClient } from '@/lib/supabase/server-admin'

const supabase = createServerAdminClient()
await clearWhatsAppSession(supabase, {
  bucketName: 'whatsapp-sessions',
  folderPath: 'session'
})
```

---

## 🚧 3. Próximas Mejoras

### 3.1. Testing de Seguridad ⏳

**Objetivo:** Tests E2E que verifican aislamiento multi-tenant

```typescript
describe('Multi-tenant Security', () => {
  it('should not allow user from agency A to see data from agency B', async () => {
    // Login como usuario de agencia A
    // Intentar obtener datos de agencia B
    // Debe fallar con 403
  })
  
  it('should enforce RLS policies correctly', async () => {
    // Verificar políticas para properties, contacts, tasks
  })
})
```

**Archivos a crear:**
- `__tests__/security/multi-tenant.test.ts`
- `__tests__/security/rls-policies.test.ts`
- `__tests__/security/api-auth.test.ts`

### 3.2. Rate Limiting ⏳

**Objetivo:** Proteger endpoints contra abuso

```typescript
import rateLimit from '@/lib/rate-limit'

export const POST = withAuth(
  rateLimit({
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 500,
  }),
  async (request, user) => {
    // Handler protegido
  }
)
```

**Endpoints a proteger:**
- `/api/whatsapp/send` - 10 req/min por usuario
- `/api/broadcast/create` - 5 req/min por usuario
- `/api/broadcast/process` - 1 req/min global

### 3.3. CSP Headers ⏳

**Objetivo:** Content Security Policy contra XSS

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://yrfzhkziipeiganxpwlv.supabase.co;
  font-src 'self';
  connect-src 'self' https://yrfzhkziipeiganxpwlv.supabase.co;
`
```

### 3.4. Webhooks de Supabase ⏳

**Objetivo:** Triggers automáticos para eventos

```sql
-- Trigger: Enviar email de bienvenida al crear usuario
-- Trigger: Actualizar health_score al modificar propiedad
-- Trigger: Notificar admin cuando se crea broadcast
```

### 3.5. Monitoring y Alertas ⏳

**Objetivo:** Observabilidad del sistema

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Uptime Robot** - Monitoreo de uptime
- **Supabase Metrics** - DB performance

---

## 📊 Resumen de Cambios

### Archivos Nuevos

1. ✅ `src/types/database.ts` - Tipos consolidados (500+ líneas)
2. ✅ `src/types/index.ts` - Punto de entrada único
3. ✅ `src/lib/whatsapp/supabase-auth-state.ts` - Adaptador Supabase Storage
4. ✅ `docs/PHASE_3_IMPROVEMENTS.md` - Esta documentación

### Archivos Modificados

1. ✅ `src/hooks/useCurrentUser.ts` - Usa tipos de `@/types`
2. ✅ `src/lib/auth/middleware.ts` - Usa tipos de `@/types`
3. ✅ `src/lib/whatsapp/service.ts` - Usa Supabase Storage en producción

### Estadísticas

```
Archivos nuevos: 4
Archivos modificados: 3
Líneas agregadas: ~800
Líneas consolidadas: ~200 (tipos duplicados eliminados)
```

### Beneficios Acumulados

1. ✅ **Type Safety** - Tipos únicos y consistentes
2. ✅ **Persistencia** - Sesión WhatsApp sobrevive deployments
3. ✅ **DX Mejorado** - Imports simples y claros
4. ✅ **Serverless Ready** - Compatible con Vercel Edge
5. ✅ **Mantenibilidad** - Código más organizado

---

## 🚀 Deployment

**Orden de Aplicación:**

1. **Deploy código actualizado:**
   ```bash
   git push
   ```

2. **Variables de entorno (producción):**
   ```bash
   NODE_ENV=production
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

3. **Primer uso en producción:**
   - WhatsApp pedirá escanear QR una vez
   - Sesión se guarda automáticamente en Storage
   - Deployments posteriores: no requieren QR

4. **Verificar bucket creado:**
   ```
   Supabase Dashboard → Storage → whatsapp-sessions
   ```

---

**Última actualización:** 2026-02-01  
**Estado:** Fase 3 (Parcial) Completada ✅  
**Próximo:** Tests de Seguridad, Rate Limiting, CSP Headers
