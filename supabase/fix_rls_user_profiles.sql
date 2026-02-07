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
