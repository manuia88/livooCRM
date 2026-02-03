# ✅ Checklist de Deployment - livooCRM

## 📊 Estado Actual

| Paso | Estado | Fecha | Notas |
|------|--------|-------|-------|
| 1. SQL Migration | ✅ COMPLETADO | 2026-02-03 | RLS multi-tenant activo |
| 2. Variables Entorno | ⏳ PENDIENTE | - | Configurar en Vercel |
| 3. Validar Config | ⏳ PENDIENTE | - | Ejecutar localmente |
| 4. Deploy | ⏳ PENDIENTE | - | Push a Vercel |
| 5. Tests Seguridad | ⏳ PENDIENTE | - | Post-deployment |

---

## ✅ PASO 1: SQL MIGRATION (COMPLETADO)

### Script Ejecutado:
```
supabase/migrations/complete_rls_setup.sql
```

### Verificación:
✅ **Funciones Helper:**
- `public.user_agency_id()` - CREADA ✓
- `public.is_agency_admin()` - CREADA ✓

✅ **Políticas RLS Activas:**
- agencies: 2 políticas
- contacts: 6 políticas
- properties: 13 políticas
- tasks: 6 políticas
- user_profiles: 4 políticas

✅ **RLS Habilitado:**
- agencies: ENABLED ✓
- contacts: ENABLED ✓
- properties: ENABLED ✓
- tasks: ENABLED ✓
- user_profiles: ENABLED ✓

✅ **Columnas Agregadas:**
- contacts: `assigned_to`, `created_by`
- properties: `assigned_to`, `created_by`
- tasks: `assigned_to`, `created_by`

✅ **Triggers Creados:**
- `trigger_set_created_by_contacts`
- `trigger_set_created_by_properties`
- `trigger_set_created_by_tasks`

### Resultado:
🎯 **AISLAMIENTO MULTI-TENANT ACTIVO**
- Usuarios solo ven datos de su agencia
- No pueden crear/modificar datos de otras agencias
- RLS protege todas las operaciones CRUD

---

## ⏳ PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### En Vercel Dashboard:

1. **Ve a:** [Vercel Dashboard](https://vercel.com) → Tu proyecto → Settings → Environment Variables

2. **Agrega estas variables:**

```bash
# Supabase URL (ya debería estar)
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co

# Supabase Anon Key (ya debería estar)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# SERVICE ROLE KEY (🔴 CRÍTICO - FALTA)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
# ⚠️ Obtenerlo de: Supabase Dashboard → Settings → API → service_role key

# Environment
NODE_ENV=production

# App URL (para CORS)
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

3. **Importante:**
   - ✅ Aplica las variables a **Production**, **Preview** y **Development**
   - ✅ Guarda cambios
   - ✅ Re-deploy para que tomen efecto

### Cómo obtener SERVICE_ROLE_KEY:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Tu proyecto → Settings → API
3. Busca la sección **Project API keys**
4. Copia el `service_role` key (NO el `anon` key)
5. **⚠️ NUNCA** compartas esta key públicamente

---

## ⏳ PASO 3: VALIDAR CONFIGURACIÓN

### En tu Terminal Local:

```bash
# Validar que todo esté configurado
npm run validate-config
```

**Resultado esperado:**
```
✅ Supabase - Todo correcto
✅ Environment - Todo correcto  
✅ Security - Todo correcto
✅ VALIDACIÓN EXITOSA
```

**Si hay errores:**
- Revisa que `.env.local` tenga todas las variables
- Verifica que las keys sean correctas
- Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurada

---

## ⏳ PASO 4: DEPLOY A PRODUCCIÓN

### Opción A: Auto-Deploy (Recomendado)

Si tienes auto-deploy activado en Vercel:
```bash
# Ya está deployado automáticamente cuando hiciste git push
```

### Opción B: Deploy Manual

```bash
# En Vercel Dashboard
1. Ve a tu proyecto
2. Deployments → Deploy
3. Selecciona la branch main
4. Click en "Deploy"
```

### Verificar Deployment:

1. **Espera a que termine** (2-3 minutos)
2. **Abre tu app:** `https://tu-app.vercel.app`
3. **Verifica que carga** sin errores
4. **Revisa logs:** Vercel → Functions → Logs

---

## ⏳ PASO 5: CREAR USUARIOS DE TEST

### En tu Terminal:

```bash
# Crear usuarios de prueba en 2 agencias diferentes
npm run setup-test-users
```

**Credenciales creadas:**
```
Agencia A:
  Email: test-agency-a@example.com
  Password: Test123456!

Agencia B:
  Email: test-agency-b@example.com
  Password: Test123456!
```

---

## ⏳ PASO 6: EJECUTAR TESTS DE SEGURIDAD

### En tu Terminal:

```bash
# Ejecutar tests de seguridad multi-tenant
npm run test:security
```

**Resultado esperado:**
```
✓ Properties isolation - Agency A vs B (3 tests)
✓ Contacts isolation (1 test)
✓ Tasks isolation (1 test)
✓ User profiles isolation (1 test)
✓ API endpoint security (3 tests)

Tests: 10 passed, 10 total
```

**Si algún test falla:**
- Verifica que las políticas RLS estén activas
- Revisa que los usuarios de test existan
- Checa logs de Supabase

---

## ⏳ PASO 7: VERIFICAR EN PRODUCCIÓN

### Test Manual de Multi-Tenant:

1. **Login como Usuario A:**
   - Email: `test-agency-a@example.com`
   - Password: `Test123456!`
   - Ve a `/backoffice/propiedades`
   - **Verifica:** Solo ves propiedades de Agencia A

2. **Logout y Login como Usuario B:**
   - Email: `test-agency-b@example.com`
   - Password: `Test123456!`
   - Ve a `/backoffice/propiedades`
   - **Verifica:** Solo ves propiedades de Agencia B

3. **Test de Rate Limiting:**
   - Intenta enviar 11 mensajes de WhatsApp en 1 minuto
   - El mensaje #11 debe dar error 429

4. **Verificar Logs:**
   - Ve a Vercel → Functions → Logs
   - Deberías ver logs en formato JSON
   - Busca eventos de seguridad

---

## ⏳ PASO 8: CONECTAR WHATSAPP (Primera vez)

### En Producción:

1. **Ve a:** `/backoffice/inbox` (o tu ruta de WhatsApp)
2. **Click en "Conectar WhatsApp"**
3. **Escanea el QR** con tu WhatsApp
4. **Espera a que conecte**

**Después del primer escaneo:**
- La sesión se guarda en Supabase Storage
- Bucket: `whatsapp-sessions`
- No necesitarás re-escanear en futuros deployments

**Verificar que funciona:**
```bash
# En Supabase Dashboard → Storage
# Debe existir bucket: whatsapp-sessions
# Con archivos: session/creds.json y session/keys/...
```

---

## 📋 CHECKLIST FINAL

### Antes de considerar el deployment completo:

- [ ] ✅ Paso 1: SQL Migration aplicada y verificada
- [ ] ⏳ Paso 2: Variables de entorno configuradas en Vercel
- [ ] ⏳ Paso 3: `npm run validate-config` pasa sin errores
- [ ] ⏳ Paso 4: Deploy a producción completado
- [ ] ⏳ Paso 5: Usuarios de test creados
- [ ] ⏳ Paso 6: Tests de seguridad pasan (10/10)
- [ ] ⏳ Paso 7: Verificación manual en producción OK
- [ ] ⏳ Paso 8: WhatsApp conectado y persistente

### Verificaciones de Seguridad:

- [ ] Usuario A NO ve datos de Usuario B
- [ ] Usuario B NO ve datos de Usuario A
- [ ] Rate limiting funciona (429 después de límite)
- [ ] Logs de seguridad se generan
- [ ] Endpoints sin auth retornan 401

### Verificaciones Técnicas:

- [ ] WhatsApp mantiene sesión después de redeploy
- [ ] Properties se crean con `created_by` automático
- [ ] Contacts se crean con `created_by` automático
- [ ] Tasks se crean con `created_by` automático
- [ ] RLS bloquea queries cross-agency

---

## 🆘 TROUBLESHOOTING

### Error: "User profile not found"

**Solución:**
```bash
# Ejecutar en Supabase SQL Editor
# supabase/fix_missing_user_profile.sql
```

### Error: "SERVICE_ROLE_KEY no configurada"

**Solución:**
1. Ve a Supabase → Settings → API
2. Copia `service_role` key
3. Agrégala en Vercel → Environment Variables
4. Redeploy

### Tests de seguridad fallan

**Solución:**
1. Verifica que `complete_rls_setup.sql` se ejecutó
2. Ejecuta las queries de verificación
3. Revisa que RLS esté ENABLED
4. Confirma que funciones helper existen

### WhatsApp no mantiene sesión

**Solución:**
1. Verifica que bucket `whatsapp-sessions` existe
2. Verifica que `NODE_ENV=production` en Vercel
3. Checa que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
4. Re-escanea QR una vez

---

## 📞 CONTACTO Y SOPORTE

Si encuentras problemas:
1. Revisa los logs en Vercel Dashboard
2. Revisa los logs en Supabase Dashboard
3. Ejecuta `npm run validate-config` localmente
4. Verifica las queries de verificación de RLS

---

**Última actualización:** 2026-02-03  
**Estado:** Paso 1/8 Completado ✅  
**Próximo paso:** Configurar variables de entorno en Vercel
