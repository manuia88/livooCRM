# 🔧 Instrucciones para aplicar FIX de RLS

El error 406 que estás viendo se debe a que las políticas RLS (Row Level Security) están bloqueando el acceso a `user_profiles` y `agencies`.

## Pasos para aplicar el fix:

### 1. Ve al Supabase Dashboard
- Abre: https://supabase.com/dashboard/project/yrfzhkziipeiganxpwlv
- Ve a **SQL Editor**

### 2. Ejecuta el siguiente SQL:

```sql
-- =====================================================
-- FIX RLS para user_profiles y agencies
-- Asegura que los usuarios puedan ver su propio perfil
-- =====================================================

BEGIN;

-- 1. Asegurar que RLS está habilitado
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agencies ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their agency" ON agencies;

-- 3. Políticas para user_profiles
-- Ver propio perfil (SELECT)
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Actualizar propio perfil (UPDATE)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Políticas para agencies
-- Ver la agencia a la que pertenece (SELECT)
CREATE POLICY "Users can view their agency"
ON agencies FOR SELECT
USING (
    id IN (
        SELECT agency_id 
        FROM user_profiles 
        WHERE user_profiles.id = auth.uid()
    )
);

-- 5. Verificar que las políticas se crearon
DO $$
BEGIN
    RAISE NOTICE 'RLS policies applied successfully for user_profiles and agencies';
END $$;

COMMIT;
```

### 3. Verifica que se aplicó correctamente:

Deberías ver el mensaje: `RLS policies applied successfully for user_profiles and agencies`

### 4. Recarga el backoffice

Una vez aplicado el SQL, recarga el navegador (Cmd+R o Ctrl+R) y el error 406 debería desaparecer.

---

## Si el problema persiste

Si después de aplicar el SQL sigues viendo el error, verifica:

1. Que tu usuario tenga un perfil en `user_profiles` con el mismo `id` que `auth.users`
2. Que el perfil tenga un `agency_id` válido
3. Que la agencia exista en la tabla `agencies`

Puedes verificar con:

```sql
SELECT id, email FROM auth.users WHERE email = 'tu_email@ejemplo.com';
SELECT * FROM user_profiles WHERE id = 'TU_USER_ID';
SELECT * FROM agencies WHERE id = 'TU_AGENCY_ID';
```
