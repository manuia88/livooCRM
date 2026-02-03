# 📋 Checklist de Verificación en Producción

**URL de Producción:** https://livoo-crm.vercel.app

---

## ✅ **1. Verificar Autenticación**

### Login Básico
1. Ve a: https://livoo-crm.vercel.app/auth
2. Intenta login con credenciales inválidas
   - **Resultado esperado:** Error de autenticación
3. Login con tu usuario real
   - **Resultado esperado:** Redirect a `/backoffice`

---

## ✅ **2. Verificar Multi-Tenant (RLS)**

### Usuarios de Test Disponibles:

**Agencia A:**
- Email: `test-agency-a@example.com`
- Password: `Test123456!`

**Agencia B:**
- Email: `test-agency-b@example.com`
- Password: `Test123456!`

### Prueba de Aislamiento:

1. **Login como Agency A:**
   ```
   URL: https://livoo-crm.vercel.app/auth
   Email: test-agency-a@example.com
   Password: Test123456!
   ```

2. **Verificar que solo ves datos de Agency A:**
   - Dashboard: Solo métricas de tu agencia
   - Propiedades: Solo propiedades de tu agencia
   - Contactos: Solo contactos de tu agencia
   - Usuarios: Solo usuarios de tu agencia

3. **Logout y Login como Agency B:**
   ```
   Email: test-agency-b@example.com
   Password: Test123456!
   ```

4. **Verificar datos diferentes:**
   - Los números y datos deben ser diferentes a Agency A
   - NO debes ver propiedades/contactos de Agency A

---

## ✅ **3. Verificar Rate Limiting**

### Test Manual:

1. **Abre DevTools** (F12)
2. **Ve a** `/backoffice/propiedades`
3. **En Console, ejecuta:**
   ```javascript
   // Intentar hacer 20 requests rápidos
   for(let i = 0; i < 20; i++) {
     fetch('/api/properties').then(r => console.log(i, r.status))
   }
   ```

4. **Resultado esperado:**
   - Primeras ~10 requests: `200 OK`
   - Siguientes requests: `429 Too Many Requests`

---

## ✅ **4. Verificar Headers de Seguridad**

### Test con DevTools:

1. **Abre DevTools** → Network
2. **Recarga la página**
3. **Click en el primer request** (document)
4. **Ve a Response Headers**

**Headers esperados:**
```
✅ Content-Security-Policy: default-src 'self'...
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy: camera=(), microphone=()...
```

---

## ✅ **5. Verificar Cron Jobs (Opcional)**

Los cron jobs se ejecutan automáticamente:

**Configurados:**
- `/api/tasks/auto-generate` - **Diario a medianoche** (00:00)
- `/api/tasks/check-overdue` - **Diario al mediodía** (12:00)

**Verificar:**
1. Ve a Vercel Dashboard → Tu Proyecto → Cron Jobs
2. Verifica que aparecen configurados
3. Los logs aparecerán después de la primera ejecución

---

## ✅ **6. Verificar Logs de Errores**

### En Vercel:

1. **Ve a:** https://vercel.com/manuels-projects-b495aa85/livoo-crm
2. **Click en:** Deployments → Production
3. **Click en:** Functions
4. **Verificar:**
   - ✅ No hay errores críticos
   - ✅ Las funciones responden correctamente

---

## ✅ **7. Verificar Funcionalidad Principal**

### Test de Flujo Completo:

1. **Login** como usuario real
2. **Dashboard:** Ver métricas
3. **Propiedades:**
   - Ver lista
   - Abrir detalle de propiedad
   - (Opcional) Crear nueva propiedad
4. **Contactos:**
   - Ver lista
   - Abrir detalle de contacto
5. **Tareas:**
   - Ver lista
   - Verificar que se marcan como vencidas

---

## ⚠️ **Problemas Comunes**

### Si no puedes hacer login:

1. Verifica que el `NEXT_PUBLIC_SUPABASE_URL` en Vercel es correcto
2. Verifica que el `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcto
3. Ve a Supabase Dashboard → Authentication → Users
4. Verifica que tu usuario existe

### Si ves error "User profile not found":

1. El usuario existe en `auth.users` pero no en `user_profiles`
2. Ejecuta el SQL de fix:
   ```sql
   -- Ver en: supabase/fix_missing_user_profile.sql
   ```

### Si RLS no funciona:

1. Verifica que `complete_rls_setup.sql` está aplicado
2. Ve a Supabase Dashboard → Database → Policies
3. Verifica que existen políticas para:
   - `properties`
   - `contacts`
   - `tasks`
   - `user_profiles`

---

## 📊 **Checklist Final**

- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Solo veo datos de mi agencia
- [ ] No veo datos de otras agencias
- [ ] Rate limiting funciona
- [ ] Headers de seguridad presentes
- [ ] No hay errores en console
- [ ] CRUD de propiedades funciona
- [ ] CRUD de contactos funciona
- [ ] Tareas se muestran correctamente

---

## ✅ **Si TODO está marcado:**

**¡FELICIDADES! 🎉**

Tu aplicación está desplegada correctamente en producción con:
- ✅ Autenticación funcionando
- ✅ Multi-tenant RLS activo
- ✅ Rate limiting configurado
- ✅ Headers de seguridad
- ✅ Cron jobs programados

---

## 🔗 **Recursos Útiles**

- **Producción:** https://livoo-crm.vercel.app
- **Vercel Dashboard:** https://vercel.com/manuels-projects-b495aa85/livoo-crm
- **Supabase Dashboard:** https://supabase.com/dashboard/project/yrfzhkziipeiganxpwlv
- **GitHub Repo:** https://github.com/manuia88/livooCRM

---

**Documentado el:** 3 de Febrero, 2026
