-- =============================================
-- TEMPORAL: Deshabilitar RLS en user_profiles
-- Solo para testing, NO usar en producción
-- =============================================

-- Deshabilitar RLS temporalmente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles' AND schemaname = 'public';
