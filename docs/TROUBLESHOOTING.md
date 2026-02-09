# Troubleshooting

Guia de problemas comunes y sus soluciones para Livoo CRM.

## Build & Development

### Error: "Module not found"

**Sintoma:**
```
Error: Cannot find module '@/components/...'
```

**Causa:** Cache corrupto o dependencias desactualizadas.

**Solucion:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Error: "Type error: Property does not exist"

**Sintoma:**
```
Type error: Property 'xyz' does not exist on type 'ABC'
```

**Causa:** Types de Supabase desactualizados o tipos incorrectos.

**Solucion:**
1. Verificar que el import del type es correcto en `src/types/`
2. Si el campo es nuevo en la BD, actualizar `src/types/database.ts`
3. Verificar `tsconfig.json` tiene paths correctos:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Error: "Build failed" en desarrollo

**Sintoma:**
```
Failed to compile
```

**Solucion:**
```bash
# Limpiar cache de Next.js
rm -rf .next

# Si usa Turbopack, verificar compatibilidad
npm run dev -- --turbo

# Sin Turbopack si hay problemas
npm run dev
```

### Puerto 3000 ocupado

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solucion:**
```bash
# Encontrar y matar el proceso
lsof -i :3000
kill -9 <PID>

# O usar otro puerto
npm run dev -- --port 3001
```

## Base de Datos

### Error: "password authentication failed"

**Sintoma:**
```
error: password authentication failed for user "postgres"
```

**Causa:** Password incorrecto en `.env.local` o password reseteado en Supabase.

**Solucion:**
1. Ir a Supabase Dashboard > Settings > Database
2. Copiar el connection string actualizado
3. Actualizar `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[nueva_key]
   SUPABASE_SERVICE_ROLE_KEY=[nueva_key]
   ```
4. Reiniciar el servidor de desarrollo

### Error: "relation does not exist"

**Sintoma:**
```
error: relation "properties" does not exist
```

**Causa:** Tablas no creadas o migraciones no aplicadas.

**Solucion:**
```bash
# Opcion 1: Aplicar schema completo
# Copiar contenido de supabase/master_setup_complete.sql
# Pegarlo en Supabase SQL Editor y ejecutar

# Opcion 2: Aplicar migraciones en orden
# Ejecutar archivos de supabase/migrations/ en orden numerico
# empezando por 0001_initial_schema.sql
```

### Error: "new row violates row-level security policy"

**Sintoma:**
```
new row violates row-level security policy for table "properties"
```

**Causa:** El usuario no tiene permisos RLS o falta `agency_id`.

**Solucion:**
1. Verificar que el usuario tiene `agency_id` en `profiles`:
   ```sql
   SELECT id, email, role, agency_id FROM profiles WHERE id = auth.uid();
   ```
2. Verificar policies activas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'properties';
   ```
3. Si es desarrollo, verificar que el service role key es correcto para bypass RLS
4. Ver [RLS_SECURITY.md](./RLS_SECURITY.md) para detalle de policies

### Queries lentas

**Sintoma:** Dashboard o listados tardan mas de 2 segundos.

**Diagnostico:**
```sql
-- En Supabase SQL Editor
EXPLAIN ANALYZE
SELECT * FROM properties WHERE agency_id = 'tu-agency-id';
```

**Solucion:**
1. Verificar que indexes existen:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'properties';
   ```
2. Si faltan indexes, aplicar migracion:
   ```sql
   -- supabase/migrations/20260209140000_create_indexes.sql
   CREATE INDEX IF NOT EXISTS idx_properties_agency ON properties(agency_id);
   CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
   ```
3. Refrescar materialized views:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
   ```

Ver [DATABASE_PERFORMANCE.md](./DATABASE_PERFORMANCE.md) para mas optimizaciones.

## Autenticacion

### Error: "Session not found" / No puede acceder a backoffice

**Sintoma:** Usuario es redirigido al login constantemente.

**Causa:** Session expirada, cookies corrutas, o middleware bloqueando.

**Solucion:**
1. Limpiar cookies del navegador:
   - Chrome DevTools > Application > Cookies > Clear all
2. Si persiste, forzar signout:
   ```typescript
   import { createClient } from '@/lib/supabase/client'
   const supabase = createClient()
   await supabase.auth.signOut()
   ```
3. Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son correctos
4. Verificar middleware en `src/lib/auth/middleware.ts`

### Error: "Invalid JWT" / Token expirado

**Sintoma:**
```
AuthApiError: invalid claim: missing sub claim
```

**Causa:** Token JWT corrupto o expirado sin refresh.

**Solucion:**
```typescript
// Forzar refresh de session
const supabase = createClient()
const { data, error } = await supabase.auth.refreshSession()

if (error) {
  // Session completamente expirada, redirigir a login
  await supabase.auth.signOut()
  window.location.href = '/auth/login'
}
```

### Usuario no tiene rol asignado

**Sintoma:** Usuario puede hacer login pero no ve datos en backoffice.

**Solucion:**
```sql
-- Verificar perfil del usuario
SELECT * FROM profiles WHERE email = 'usuario@email.com';

-- Si no tiene agency_id o role, asignar:
UPDATE profiles
SET role = 'agent', agency_id = 'tu-agency-id'
WHERE email = 'usuario@email.com';
```

## Mapas (Leaflet)

### Error: "L is not defined" / "window is not defined"

**Sintoma:**
```
ReferenceError: L is not defined
```

**Causa:** Leaflet requiere `window` y no funciona con SSR.

**Solucion:** Usar dynamic import con `ssr: false`:
```typescript
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(
  () => import('@/components/maps/PropertyMap'),
  { ssr: false, loading: () => <div>Cargando mapa...</div> }
)
```

### Mapa gris / Tiles no cargan

**Sintoma:** El mapa se renderiza pero las imagenes del mapa no aparecen.

**Causa:** Problema de red, CSP bloqueando tiles, o URL incorrecta.

**Solucion:**
1. Verificar conexion a internet
2. Verificar que CSP permite OpenStreetMap en `next.config.ts`:
   ```
   img-src 'self' *.tile.openstreetmap.org ...
   ```
3. Verificar URL del TileLayer:
   ```typescript
   <TileLayer
     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
     attribution='&copy; OpenStreetMap contributors'
   />
   ```
4. Verificar que los estilos de Leaflet estan importados:
   ```typescript
   import 'leaflet/dist/leaflet.css'
   ```

### Marcadores no aparecen

**Causa comun:** Icons de Leaflet no se cargan con webpack/turbopack.

**Solucion:**
```typescript
import L from 'leaflet'

// Fix para iconos de Leaflet con Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})
```

## WhatsApp (Baileys)

### QR code no aparece

**Sintoma:** Widget de WhatsApp no muestra QR para escanear.

**Solucion:**
1. Verificar que el servicio de WhatsApp esta corriendo
2. Verificar logs del servidor para errores de Baileys
3. Limpiar sessions anteriores:
   ```bash
   # Si hay archivos de session en storage
   # Verificar en Supabase Storage > whatsapp-sessions
   ```
4. Reiniciar el servidor

### Session de WhatsApp expira

**Sintoma:** WhatsApp se desconecta y requiere re-escanear QR.

**Causa:** Sessions de Baileys duran aproximadamente 30 dias.

**Solucion:**
1. Re-escanear QR code desde el backoffice
2. La session se persiste automaticamente en Supabase via `supabase-auth-state.ts`
3. Programar re-escaneo mensual como tarea preventiva

### Mensajes no se envian

**Causa posible:** Rate limiting, numero bloqueado, o formato incorrecto.

**Solucion:**
1. Verificar formato de numero (con codigo de pais): `521XXXXXXXXXX`
2. Verificar que la session esta activa en el dashboard
3. Revisar logs de la API `/api/whatsapp`
4. Verificar rate limiting (no enviar mas de 1 msg/seg)

## Imagenes

### Error: "File too large"

**Sintoma:**
```
Error: File size exceeds limit
```

**Solucion:**
1. Comprimir imagen antes de subir (el sistema usa Sharp para esto)
2. Verificar limites en el endpoint de upload
3. Formatos soportados: JPG, PNG, WebP
4. Tamano maximo recomendado: 10MB por imagen

### Error: "Sharp processing failed"

**Sintoma:**
```
Error: Input buffer contains unsupported image format
```

**Causa:** Formato de imagen no soportado o archivo corrupto.

**Solucion:**
1. Verificar formato (solo JPG, PNG, WebP soportados)
2. Verificar que el archivo no esta corrupto
3. Si es un formato especial (HEIC, TIFF), convertir antes de subir
4. Sharp requiere libvips en el sistema (generalmente ya incluido en Vercel)

### Imagenes no se muestran en produccion

**Causa:** Dominio no configurado en `next.config.ts`.

**Solucion:** Agregar el dominio a `images.remotePatterns`:
```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
    },
    // Agregar otros dominios necesarios
  ],
}
```

## Performance

### Pagina carga lentamente

**Diagnostico:**
```bash
# Bundle analyzer
npm run analyze

# Lighthouse (en Chrome DevTools)
# Performance tab > Record
```

**Soluciones comunes:**
1. Lazy load de componentes pesados:
   ```typescript
   const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false })
   ```
2. Verificar que React Query tiene `staleTime` configurado (evita refetch innecesarios)
3. Verificar que imagenes usan `next/image` con sizes apropiados
4. Verificar bundle size con `npm run analyze`

### Dashboard lento

**Causa:** Queries sin indexes o materialized views no actualizadas.

**Solucion:**
1. Refrescar materialized views:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
   ```
2. Verificar que indexes estan creados (ver seccion Base de Datos)
3. Verificar React Query devtools para queries redundantes:
   ```typescript
   // En desarrollo, verificar con:
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   // Incluido automaticamente en layout de desarrollo
   ```

### Memoria alta en el navegador

**Causa posible:** Leaks de subscriptions, listas grandes sin virtualizacion.

**Solucion:**
1. Verificar que subscriptions de Supabase Realtime se limpian:
   ```typescript
   useEffect(() => {
     const subscription = supabase
       .channel('changes')
       .on('postgres_changes', { ... }, handler)
       .subscribe()

     return () => {
       subscription.unsubscribe()
     }
   }, [])
   ```
2. Para listas grandes, usar `useInfiniteProperties` con paginacion
3. Limitar resultados en queries (usar `.range()` o `.limit()`)

## Deployment

### Error: "Build failed on Vercel"

**Sintoma:**
```
Error: Build failed with exit code 1
```

**Solucion:**
1. Verificar env vars en Vercel Dashboard > Settings > Environment Variables
2. Verificar que build pasa localmente:
   ```bash
   npm run build
   ```
3. Verificar logs completos en Vercel > Deployments > [deployment] > Build Logs
4. Errores comunes:
   - Variables de entorno faltantes
   - TypeScript strict errors
   - Dependencias no instaladas

### Error: "Function timeout"

**Sintoma:**
```
Error: Function execution timeout
```

**Causa:** API Route excede el tiempo limite (10s default en hobby, 60s en pro).

**Solucion:**
1. Optimizar la funcion para ser mas rapida
2. Aumentar timeout en `vercel.json` (solo plan Pro):
   ```json
   {
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```
3. Para operaciones largas, considerar dividir en multiples llamadas

### Variables de entorno no disponibles

**Sintoma:** `process.env.VARIABLE` retorna `undefined` en produccion.

**Solucion:**
1. Variables que necesita el browser deben tener prefijo `NEXT_PUBLIC_`
2. Variables server-only NO deben tener el prefijo
3. Verificar que estan configuradas en Vercel Dashboard
4. Verificar que estan en el Environment correcto (Production/Preview/Development)

### Cron jobs no se ejecutan

**Sintoma:** Tareas automaticas no se generan ni verifican.

**Solucion:**
1. Verificar `vercel.json`:
   ```json
   {
     "crons": [
       { "path": "/api/tasks/auto-generate", "schedule": "0 0 * * *" },
       { "path": "/api/tasks/check-overdue", "schedule": "0 12 * * *" }
     ]
   }
   ```
2. Cron jobs solo funcionan en deployments de produccion (no en preview)
3. Verificar logs: Vercel Dashboard > Cron Jobs
4. Testear manualmente: `curl https://tu-app.vercel.app/api/tasks/auto-generate`

## Email (Resend)

### Emails no se envian

**Solucion:**
1. Verificar `RESEND_API_KEY` en `.env.local`
2. Verificar dominio configurado en Resend Dashboard
3. Verificar logs en `/api/send-email`
4. En desarrollo, Resend tiene modo sandbox (solo envia a emails verificados)

### Emails llegan a spam

**Solucion:**
1. Configurar SPF, DKIM, DMARC en el dominio
2. Verificar dominio en Resend Dashboard
3. Usar direccion de remitente del dominio verificado

## Geocoding

### Geocoding no retorna resultados

**Causa:** API key invalida, rate limiting, o direccion mal formateada.

**Solucion:**
1. Verificar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Verificar que la API de Geocoding esta habilitada en Google Cloud Console
3. Verificar formato de direccion (incluir ciudad y estado)
4. Si usa Nominatim (gratis), respetar rate limit de 1 req/seg

## Debugging General

### 1. Verificar logs del servidor

```bash
# En desarrollo
# Logs aparecen en terminal donde corre npm run dev

# En Vercel
vercel logs --follow
```

### 2. React Query DevTools

Disponible automaticamente en desarrollo. Permite ver:
- Queries activas y su estado
- Cache contents
- Mutations en progreso

### 3. Supabase Dashboard Logs

Dashboard > Logs > Filtrar por:
- API Requests
- Database Queries
- Auth Events
- Storage Operations

### 4. Browser DevTools

- **Network:** Verificar requests/responses (filtrar por Fetch/XHR)
- **Console:** Ver errores y warnings
- **Application:** Verificar cookies, localStorage
- **Performance:** Analizar renders y bottlenecks

### 5. Verificar estado del sistema

```bash
# Verificar que Supabase responde
curl https://[project].supabase.co/rest/v1/ \
  -H "apikey: [anon_key]"

# Verificar build local
npm run build

# Verificar lint
npm run lint

# Verificar tests
npm test
```

## Comandos de Reset

Cuando nada funciona, estos comandos limpian todo:

```bash
# Reset completo del entorno de desarrollo
rm -rf .next node_modules
npm install
npm run dev

# Reset de cache de Next.js
rm -rf .next
npm run dev

# Verificar configuracion
npm run validate-config

# Pre-deploy check completo
npm run pre-deploy
```

## Obtener Ayuda

1. **Buscar en docs:** Revisar archivos en `docs/` para guias especificas
2. **Buscar issues:** [GitHub Issues](https://github.com/manuia88/livoocrmag/issues)
3. **Preguntar al equipo:** Slack #livoo-dev
4. **Crear issue:** Usar los templates de bug report en GitHub
