# 🔒 Correcciones de Seguridad - Base Técnica Sólida

Este documento describe las correcciones fundamentales de seguridad implementadas para establecer una base técnica sólida en livooCRM.

## 📋 Índice

1. [Fase 1: Fundamentos de Seguridad](#fase-1-fundamentos-de-seguridad)
2. [Fase 2: Protección de Endpoints](#fase-2-protección-de-endpoints)
3. [Fase 3: Mejoras Arquitectónicas](#fase-3-mejoras-arquitectónicas)
4. [Verificación y Testing](#verificación-y-testing)

---

## 🏗️ Fase 1: Fundamentos de Seguridad

### ✅ 1.1. Políticas RLS Multi-Tenant Corregidas

**Problema Crítico:**
- TODAS las políticas RLS usaban `USING (true)`, permitiendo que usuarios de una agencia vean/modifiquen datos de OTRAS agencias
- Violación completa del aislamiento multi-tenant
- Riesgo: Pérdida de datos, violación de privacidad, incumplimiento legal

**Solución Implementada:**
- Archivo: `supabase/migrations/fix_rls_multi_tenant.sql`
- Helper functions:
  - `auth.user_agency_id()`: Obtiene el agency_id del usuario actual
  - `auth.is_agency_admin()`: Verifica si el usuario es admin/manager

**Políticas Implementadas:**

#### **user_profiles**
```sql
-- Ver solo perfiles de la misma agencia
CREATE POLICY "users_view_own_profile" ON user_profiles
  USING (id = auth.uid() OR (agency_id = auth.user_agency_id() AND auth.is_agency_admin()));

-- Actualizar solo su propio perfil (o todos si es admin)
CREATE POLICY "users_update_own_profile" ON user_profiles
  USING (id = auth.uid() OR (agency_id = auth.user_agency_id() AND auth.is_agency_admin()))
  WITH CHECK (agency_id = auth.user_agency_id());
```

#### **properties**
```sql
-- Ver solo propiedades de su agencia
CREATE POLICY "users_view_agency_properties" ON properties
  USING (agency_id = auth.user_agency_id());

-- Crear propiedades solo para su agencia
CREATE POLICY "users_insert_agency_properties" ON properties
  WITH CHECK (
    agency_id = auth.user_agency_id() 
    AND created_by = auth.uid()
  );

-- Actualizar solo propiedades asignadas (o todas si es admin)
CREATE POLICY "users_update_agency_properties" ON properties
  USING (
    agency_id = auth.user_agency_id()
    AND (
      auth.is_agency_admin() 
      OR assigned_to = auth.uid() 
      OR created_by = auth.uid()
    )
  );
```

#### **contacts, tasks, activity_logs**
- Políticas similares aplicadas a todas las tablas
- Principio: Solo ver/modificar datos de tu propia agencia

**Cómo Aplicar:**
```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar: supabase/migrations/fix_rls_multi_tenant.sql
```

**Verificación:**
```sql
-- Ver todas las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

---

### ✅ 1.2. Configuración SERVICE_ROLE_KEY Segura

**Problema Crítico:**
- Fallback silencioso a `ANON_KEY` cuando `SERVICE_ROLE_KEY` no está configurada
- Errores difíciles de debuggear en producción
- Operaciones administrativas fallan sin mensajes claros

**Solución Implementada:**
- Archivo: `src/lib/supabase/server-admin.ts`
- Helper function `createServerAdminClient()` con validación estricta

**Características:**

1. **Validación Estricta:**
```typescript
function validateServerConfig() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY no está configurada.\n' +
      'Esta variable es REQUERIDA para operaciones administrativas.'
    )
  }
  // Valida que no sea igual al ANON_KEY
  if (serviceKey === anonKey) {
    throw new Error('❌ SERVICE_ROLE_KEY está configurada con el anon key.')
  }
}
```

2. **Cliente Cacheado (Producción):**
```typescript
export function createServerAdminClient(): SupabaseClient {
  // En producción, cachear para mejor performance
  if (process.env.NODE_ENV === 'production' && serverAdminClient) {
    return serverAdminClient
  }
  
  const { url, serviceKey } = validateServerConfig()
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false }
  })
  
  return client
}
```

3. **Protección contra uso en Cliente:**
```typescript
export function runOnServer<T>(fn: () => T): T {
  if (!isServer()) {
    throw new Error(
      '❌ Intento de ejecutar función de servidor en el cliente.\n' +
      'createServerAdminClient() solo puede usarse en:\n' +
      '- API Routes\n' +
      '- Server Components\n' +
      '- Server Actions'
    )
  }
  return fn()
}
```

**Archivos Actualizados:**
- ✅ `src/lib/whatsapp/service.ts`
- ✅ `src/app/api/broadcast/process/route.ts`
- ✅ `src/app/api/broadcast/create/route.ts`

**Antes (Inseguro):**
```typescript
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ❌
);
```

**Después (Seguro):**
```typescript
import { createServerAdminClient } from '@/lib/supabase/server-admin';
const supabase = createServerAdminClient(); // ✅ Valida automáticamente
```

**Configurar Variables de Entorno:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (clave pública)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (clave secreta - NUNCA exponer)
```

---

## 🚧 Fase 2: Protección de Endpoints (Siguiente)

### 🔴 2.1. API `/api/seed` Sin Autenticación

**Problema:**
- Endpoint público que pobla la BD con datos ficticios
- Cualquiera puede sobrescribir datos de producción

**Solución Planificada:**
```typescript
// src/app/api/seed/route.ts
export async function POST(request: Request) {
  // Opción 1: Restringir a development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Seed endpoint only available in development' },
      { status: 403 }
    )
  }
  
  // Opción 2: Eliminar completamente en producción
  // Se puede usar un script separado para seeding
}
```

### 🔴 2.2. Endpoints WhatsApp/Broadcast Sin Autenticación

**Problema:**
- `/api/whatsapp/send` - Cualquiera puede enviar mensajes
- `/api/broadcast/create` - Cualquiera puede crear campañas
- `/api/broadcast/process` - Cualquiera puede procesar broadcasts

**Solución Planificada:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  // Verificar sesión del usuario
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().get(name)?.value
      }
    }
  )
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Procesar request...
}
```

---

## 📊 Fase 3: Mejoras Arquitectónicas (Futuro)

### 3.1. WhatsApp Session Persistence
- **Problema:** Sesión en filesystem local se pierde tras deployment
- **Solución:** Migrar a Supabase Storage o Redis

### 3.2. Deduplicación de Código
- **Problema:** Clientes Supabase duplicados en múltiples archivos
- **Solución:** Consolidar en `src/lib/supabase/`

### 3.3. Type Safety
- **Problema:** Tipos fragmentados en 4+ archivos
- **Solución:** Consolidar en `src/types/database.ts`

---

## ✅ Verificación y Testing

### Verificar Políticas RLS

```sql
-- 1. Verificar políticas existen
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. Test como usuario de agencia A
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-agency-a-id"}';

SELECT * FROM properties; -- Debería ver solo propiedades de agencia A

-- 3. Test como usuario de agencia B
SET LOCAL request.jwt.claims = '{"sub": "user-agency-b-id"}';

SELECT * FROM properties; -- Debería ver solo propiedades de agencia B (diferentes)
```

### Verificar SERVICE_ROLE_KEY

```typescript
// Test en desarrollo
import { validateSupabaseConfig } from '@/lib/supabase/server-admin'

const { isValid, errors, warnings } = validateSupabaseConfig()

console.log('Config válida:', isValid)
console.log('Errores:', errors)
console.log('Warnings:', warnings)
```

### Test E2E

```typescript
// tests/security/multi-tenant.test.ts
describe('Multi-tenant Security', () => {
  it('should not allow user from agency A to see data from agency B', async () => {
    // TODO: Implementar tests
  })
})
```

---

## 📝 Checklist de Implementación

### Fase 1 - Fundamentos ✅

- [x] Crear políticas RLS multi-tenant correctas
- [x] Crear helper `auth.user_agency_id()`
- [x] Crear helper `auth.is_agency_admin()`
- [x] Aplicar políticas a: user_profiles, agencies, properties, contacts, tasks
- [x] Crear `createServerAdminClient()` con validación
- [x] Actualizar archivos que usan fallback a ANON_KEY
- [x] Documentar cambios

### Fase 2 - Endpoints (Pendiente)

- [ ] Proteger `/api/seed` (restringir o eliminar)
- [ ] Agregar auth a `/api/whatsapp/send`
- [ ] Agregar auth a `/api/broadcast/create`
- [ ] Agregar auth a `/api/broadcast/process`
- [ ] Crear middleware de autenticación reutilizable

### Fase 3 - Arquitectura (Pendiente)

- [ ] Migrar WhatsApp session a Supabase Storage
- [ ] Consolidar clientes Supabase
- [ ] Consolidar tipos TypeScript
- [ ] Agregar tests de seguridad

---

## 🚀 Deployment

**Orden de Aplicación:**

1. **Aplicar migraciones SQL:**
   ```bash
   # En Supabase Dashboard → SQL Editor
   # Ejecutar: supabase/migrations/fix_rls_multi_tenant.sql
   ```

2. **Configurar variables de entorno:**
   ```bash
   # Vercel/Producción
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```

3. **Deploy código actualizado:**
   ```bash
   git add .
   git commit -m "fix: Implementar base técnica segura multi-tenant"
   git push
   ```

4. **Verificar en producción:**
   - Login como usuario de agencia A
   - Verificar que solo ve datos de agencia A
   - Login como usuario de agencia B
   - Verificar que solo ve datos de agencia B

---

## 📞 Soporte

Si encuentras problemas con estos cambios:

1. **Verificar logs:** Revisar logs de Supabase y Next.js
2. **Verificar variables:** Ejecutar `validateSupabaseConfig()`
3. **Verificar políticas:** Ejecutar queries de verificación SQL
4. **Rollback si es necesario:** Revertir migraciones SQL

---

**Última actualización:** 2026-02-01  
**Autor:** Code Review Security Team  
**Estado:** Fase 1 Completada ✅
