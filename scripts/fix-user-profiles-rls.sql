-- =============================================
-- Fix User Profiles RLS Policies
-- Permite que usuarios autenticados lean su propio perfil
-- =============================================

-- 1. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "users_select_own" ON user_profiles;
DROP POLICY IF EXISTS "users_select_agency" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in own agency" ON user_profiles;

-- 2. Crear política simple: usuario puede ver su propio perfil
CREATE POLICY "users_can_read_own_profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Crear política: usuarios pueden ver perfiles de su misma agencia
CREATE POLICY "users_can_read_same_agency_profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  agency_id IN (
    SELECT agency_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- 4. Verificar que RLS está habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
