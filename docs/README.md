# 📚 Documentación livooCRM

Bienvenido a la documentación técnica de livooCRM. Este directorio contiene toda la información sobre arquitectura, seguridad, y mejoras implementadas.

---

## 📖 Índice de Documentación

### 🎯 **PLAN_MAESTRO_MEJORAS.md** ⭐ DOCUMENTO PRINCIPAL
- 📋 Plan completo de 6 fases de mejora
- 👥 12 equipos especializados (Alpha a Lima)
- 💰 Ahorro de $7,500/año
- ⚡ Mejoras de performance (73% ↓ bundle size)
- 🔒 Seguridad multi-tenant
- 📊 Estado actual y próximos pasos

### 🔒 Seguridad y Fundamentos

#### 1. **IMPLEMENTATION_COMPLETE.md** 🌟 RESUMEN EJECUTIVO
- 📊 Resumen ejecutivo de TODAS las mejoras
- ✅ Checklist completo de implementación
- 🚀 Guía de deployment a producción
- 📈 Métricas de impacto y mejoras

#### 2. **SECURITY_FIXES.md**
- 🔴 Problemas críticos resueltos (Fase 1 & 2)
- 🔐 Políticas RLS multi-tenant
- 🔑 Configuración SERVICE_ROLE_KEY
- 🛡️ Protección de endpoints
- ✅ Guías de verificación

#### 3. **RLS_SECURITY.md**
- 🔐 Políticas de Row Level Security detalladas
- 👥 Roles y permisos por agencia
- 🛡️ Aislamiento de datos multi-tenant

#### 4. **PHASE_3_IMPROVEMENTS.md**
- 📦 Consolidación de tipos TypeScript
- 🔐 WhatsApp session persistence
- 📝 Script de validación
- 🛡️ CSP headers
- 🚧 Próximas mejoras

---

### ⚡ Performance y Optimización

#### 5. **DATABASE_PERFORMANCE.md**
- 📊 Índices optimizados (GIST, GIN, compuestos)
- 🚀 Vistas materializadas para dashboard
- ⚡ Funciones SQL optimizadas
- 📈 Métricas: <100ms queries

#### 6. **BUNDLE_OPTIMIZATION.md**
- 📦 Code splitting estratégico
- ⚡ Lazy loading de componentes
- 🎯 First Load JS < 100KB
- 📊 Métricas Web Vitals

#### 7. **REACT_QUERY_PATTERNS.md**
- 🔄 Paginación cursor-based
- 💾 Caché inteligente (staleTime)
- ⚡ Optimistic updates
- ♾️ Infinite scroll

---

### 💰 Optimización de Costos

#### 8. **MAPS_MIGRATION.md**
- 🗺️ Migración Google Maps → Leaflet + OSM
- 💰 Ahorro: $200/mes ($2,400/año)
- 📍 Componentes reutilizables

#### 9. **GEOCODING_SERVICE.md**
- 📍 Geocoding con Nominatim (gratuito)
- 🔄 Reverse geocoding
- 💾 Caché en base de datos
- 💰 Ahorro: $50/mes ($600/año)

#### 10. **IMAGE_OPTIMIZATION.md**
- 🖼️ Procesamiento con Sharp
- 📏 Thumbnails automáticos
- 🚀 WebP optimization
- ⚡ Lazy loading

---

### 📱 Comunicaciones

#### 11. **WHATSAPP_INTEGRATION.md**
- 📱 Integración con Baileys
- 🔐 QR Code authentication
- 📤 Envío y recepción de mensajes
- 💰 Ahorro: $360/mes ($4,320/año)

#### 12. **WHATSAPP_SETUP.md**
- 🛠️ Guía de configuración
- 📋 Pasos de implementación
- 🔧 Troubleshooting

#### 13. **NOTIFICATIONS_SYSTEM.md**
- 🔔 Notificaciones en tiempo real (WebSocket)
- 🔄 Triggers automáticos (tareas, contactos, propiedades)
- 📬 NotificationBell component
- ⚡ Latencia <200ms

#### 14. **EMAIL_SERVICE.md**
- 📧 Emails transaccionales con Resend
- 📝 Plantillas con React Email
- 💰 Free tier: 100 emails/día ($0/mes)
- ✉️ WelcomeEmail, TaskReminderEmail

---

---

### 🗄️ Base de Datos

#### 15. **DATABASE.md**
- 📊 Schema completo de la base de datos
- 🔗 Relaciones entre tablas
- 📝 Descripción de campos

#### 16. **DATABASE_SUMMARY.md**
- 📋 Resumen de tablas principales
- 🔑 Claves primarias y foráneas
- 📊 Estadísticas

---

### 🚀 Deployment y Verificación

#### 17. **DEPLOYMENT_CHECKLIST.md**
- ✅ Checklist pre-deployment
- 🔐 Variables de entorno
- 📝 Migraciones SQL
- 🧪 Tests de verificación

#### 18. **VERIFICACION_PRODUCCION.md**
- 🔍 Verificación post-deployment
- ✅ Tests de funcionalidad
- 📊 Monitoreo de métricas

#### 19. **PR_CHECKLIST.md**
- ✅ Checklist para Pull Requests
- 📝 Plantilla de PR
- 🔍 Code review guidelines

---

### 📖 Otros Documentos

#### 20. **MIGRATION_GUIDE.md**
- 🔄 Guías de migración
- 📝 Breaking changes
- 🛠️ Pasos de actualización

#### 21. **AUTH_ANALYSIS.md**
- 🔐 Análisis del sistema de autenticación
- 👤 Flujos de usuario
- 🔑 Tokens y sesiones

---

## 🗺️ Guías Rápidas

### Para Developers Nuevos

1. Lee **PLAN_MAESTRO_MEJORAS.md** para visión completa del proyecto
2. Revisa **IMPLEMENTATION_COMPLETE.md** para contexto de implementación
3. Consulta **SECURITY_FIXES.md** para entender fundamentos de seguridad
4. Explora documentos específicos según tu área de trabajo

### Para Deployment

1. Ejecuta `npm run validate-config` antes de deployar
2. Sigue la sección "Cómo Aplicar en Producción" en **IMPLEMENTATION_COMPLETE.md**
3. Aplica migraciones SQL en orden
4. Configura variables de entorno en Vercel
5. Verifica con tests de la sección "Verificación"

### Para Debugging

1. **Error de autenticación:**
   - Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada
   - Ejecuta `npm run validate-config`
   - Revisa logs en Supabase Dashboard

2. **Datos cross-agency visibles:**
   - Verifica que migraciones RLS estén aplicadas
   - Ejecuta query de verificación de políticas (ver SECURITY_FIXES.md)

3. **WhatsApp desconectado constantemente:**
   - Verifica bucket "whatsapp-sessions" existe en Supabase Storage
   - Verifica que NODE_ENV=production en producción
   - Revisa logs del servicio WhatsApp

---

## 📦 Archivos Clave del Código

### Seguridad

| Archivo | Descripción |
|---------|-------------|
| `src/lib/supabase/server-admin.ts` | Cliente Supabase con SERVICE_ROLE_KEY |
| `src/lib/auth/middleware.ts` | Middleware de autenticación para APIs |
| `supabase/migrations/fix_rls_multi_tenant.sql` | Políticas RLS multi-tenant |

### Tipos

| Archivo | Descripción |
|---------|-------------|
| `src/types/database.ts` | Tipos maestros (500+ líneas) |
| `src/types/index.ts` | Punto de entrada único |

### WhatsApp

| Archivo | Descripción |
|---------|-------------|
| `src/lib/whatsapp/service.ts` | Servicio principal de WhatsApp |
| `src/lib/whatsapp/supabase-auth-state.ts` | Persistencia en Supabase Storage |

### Scripts

| Archivo | Descripción |
|---------|-------------|
| `scripts/validate-config.ts` | Validación pre-deployment |
| `scripts/fix-user-profile.ts` | Helper para crear perfiles de usuario |

---

## 🔗 Enlaces Útiles

### Supabase

- [Dashboard](https://supabase.com/dashboard)
- [SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [Storage](https://supabase.com/dashboard/project/_/storage)
- [Auth](https://supabase.com/dashboard/project/_/auth/users)

### Next.js

- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

### Baileys (WhatsApp)

- [GitHub](https://github.com/WhiskeySockets/Baileys)
- [Authentication](https://github.com/WhiskeySockets/Baileys#authentication)

---

## 🆘 Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY no está configurada"

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia el `service_role` key (NO el `anon` key)
3. Agrégalo a `.env.local` o Vercel:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

### Error: "User profile not found"

**Solución:**
1. Ejecuta el script SQL:
   ```bash
   # En Supabase SQL Editor
   supabase/fix_missing_user_profile.sql
   ```
2. O usa el script TypeScript:
   ```bash
   npx tsx scripts/fix-user-profile.ts
   ```

### Error: "Rendered more hooks than during the previous render"

**Solución:**
- ✅ Ya resuelto en `src/app/backoffice/layout.tsx`
- Hooks ahora están en el orden correcto
- Si persiste, limpia cache: `rm -rf .next && npm run dev`

### WhatsApp no mantiene sesión

**Solución:**
1. Verifica que `NODE_ENV=production` en producción
2. Crea el bucket manualmente si no existe:
   ```
   Supabase → Storage → Create Bucket
   Name: whatsapp-sessions
   Public: false
   ```
3. Re-escanea QR una vez
4. Sesión debería persistir

---

## 📞 Contacto y Soporte

Para preguntas técnicas:
- Revisa primero esta documentación
- Verifica logs en Supabase Dashboard
- Ejecuta `npm run validate-config`

Para reportar bugs:
- Incluye logs completos
- Describe pasos para reproducir
- Indica entorno (dev/prod)

---

## 🔄 Actualizaciones

| Fecha | Cambio | Documento |
|-------|--------|-----------|
| 2026-02-08 | Plan Maestro de 6 Fases creado | PLAN_MAESTRO_MEJORAS.md |
| 2026-02-08 | Sistema de notificaciones + emails | NOTIFICATIONS_SYSTEM.md, EMAIL_SERVICE.md |
| 2026-02-01 | Fase 1 & 2 completadas | SECURITY_FIXES.md |
| 2026-02-01 | Fase 3 completada | PHASE_3_IMPROVEMENTS.md |
| 2026-02-01 | Documentación consolidada | IMPLEMENTATION_COMPLETE.md |

---

**¡La base técnica está sólida! 🎉**

Ahora puedes construir con confianza sabiendo que los fundamentos de seguridad, autenticación, y arquitectura están correctamente implementados.
