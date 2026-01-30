# 🚀 Guía de Aplicación de Migraciones SQL

## ⚠️ IMPORTANTE: ACCIÓN REQUERIDA

Las siguientes tablas SQL deben ser creadas en Supabase para que el sistema de seguridad funcione completamente.

---

## 📋 Paso a Paso

### Opción 1: Supabase Dashboard (Recomendado para desarrollo)

1. Abre tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto **Livoo** (yrfzhkziipeiganxpwlv)
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **New Query**

#### Migration 1: User Profiles

Copia y pega el contenido de:
```
supabase/migrations/001_user_profiles.sql
```

Haz clic en **Run** ✅

**Verifica:**
- Ve a **Table Editor** → Deberías ver la tabla `user_profiles`
- Ve a **Authentication** → Policies → Deberías ver 3 policies activas

#### Migration 2: Audit Logs

Copia y pegael contenido de:
```
supabase/migrations/002_audit_logs.sql
```

Haz clic en **Run** ✅

**Verifica:**
- Tabla `audit_logs` creada
- Políticas RLS activas
- Función `log_audit()` disponible

---

### Opción 2: Supabase CLI (Para producción)

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref yrfzhkziipeiganxpwlv

# Aplicar migraciones
supabase db push
```

---

## ✅ Verificación Post-Migración

### 1. Verificar Tablas Creadas

En Supabase Dashboard → Table Editor:
- ✅ `user_profiles` existe
- ✅ `audit_logs` existe
- ✅ Ambas tienen RLS enabled

### 2. Probar con Usuario Existente

Si ya tienes usuarios registrados, necesitas crear sus perfiles:

```sql
-- Obtener ID del usuario
SELECT id, email FROM auth.users;

-- Crear perfil manualmente
INSERT INTO user_profiles (id, full_name, agency_id, role)
VALUES (
  'tu-user-id-aqui',
  'Manuel Acosta',
  '00000000-0000-0000-0000-000000000001',
  'admin'
);
```

### 3. Test de Audit Logging

1. Inicia sesión en la aplicación
2. Ve a Supabase Dashboard → Table Editor → `audit_logs`
3. Deberías ver un registro con `action = 'login'`

---

## 🔧 Troubleshooting

### Error: "permission denied for table user_profiles"

**Causa:** RLS está bloqueando el acceso

**Solución:**
1. Verifica que el usuario tiene un perfil en `user_profiles`
2. Verifica las políticas RLS están activas
3. Si es desarrollo, puedes deshabilitar RLS temporalmente:
   ```sql
   ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
   ```

### Error: "function handle_new_user() does not exist"

**Causa:** La migración no se ejecutó completamente

**Solución:**
- Re-ejecuta la migración 001_user_profiles.sql
- Verifica en **Database** → **Functions** que existe `handle_new_user`

### Usuarios nuevos no tienen perfil automáticamente

**Causa:** El trigger no está activo

**Solución:**
```sql
-- Verificar trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Re-crear si no existe
-- Ejecuta de nuevo la migración 001_user_profiles.sql
```

---

## 📊 Siguientes Pasos

Después de aplicar las migraciones:

1. ✅ **Probar registro de nuevo usuario** - Debería crear perfil automáticamente
2. ✅ **Probar audit logging** - Verificar que login/logout se registran
3. ✅ **Configurar roles** - Asignar roles específicos a usuarios
4. ⏳ **Configurar Upstash Redis** - Para rate limiting
5. ⏳ **Crear tablas adicionales** - Properties, contacts con RLS

---

## 🆘 Necesitas Ayuda?

- **Documentación:** Ver `docs/SECURITY.md`
- **Análisis:** Ver `docs/AUTH_ANALYSIS.md`
- **Progreso:** Ver `docs/PROGRESS.md`
