-- ============================================================================
-- MIGRACIÓN: Fix RLS Core Tables (SOLO TABLAS EXISTENTES)
-- ============================================================================
-- Este script aplica políticas RLS SOLO a las tablas core que existen
-- No falla si alguna tabla no existe (broadcasts, etc.)
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR FUNCIONES ANTERIORES (si existen)
-- ============================================================================

DROP FUNCTION IF EXISTS auth.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS auth.is_agency_admin() CASCADE;
DROP FUNCTION IF EXISTS public.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_agency_admin() CASCADE;

-- ============================================================================
-- 2. CREAR FUNCIONES HELPER EN SCHEMA PUBLIC
-- ============================================================================

-- Función para obtener el agency_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.user_agency_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT agency_id 
  FROM user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.user_agency_id() IS 
'Retorna el agency_id del usuario autenticado';

-- Función para verificar si el usuario es admin/manager de su agencia
CREATE OR REPLACE FUNCTION public.is_agency_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
    AND is_active = true
  );
$$;

COMMENT ON FUNCTION public.is_agency_admin() IS 
'Verifica si el usuario actual es admin o manager de su agencia';

-- ============================================================================
-- 3. POLÍTICAS RLS PARA user_profiles
-- ============================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_view_agency_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_manage_agency_profiles" ON user_profiles;

-- Ver su propio perfil
CREATE POLICY "users_view_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Ver perfiles de su agencia
CREATE POLICY "users_view_agency_profiles"
  ON user_profiles FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Actualizar su propio perfil
CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins pueden gestionar perfiles de su agencia
CREATE POLICY "admins_manage_agency_profiles"
  ON user_profiles FOR ALL
  USING (
    agency_id = public.user_agency_id()
    AND public.is_agency_admin()
  );

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- ============================================================================
-- 4. POLÍTICAS RLS PARA agencies
-- ============================================================================

DROP POLICY IF EXISTS "users_view_own_agency" ON agencies;
DROP POLICY IF EXISTS "admins_update_own_agency" ON agencies;

-- Ver su propia agencia
CREATE POLICY "users_view_own_agency"
  ON agencies FOR SELECT
  USING (id = public.user_agency_id());

-- Admins pueden actualizar su agencia
CREATE POLICY "admins_update_own_agency"
  ON agencies FOR UPDATE
  USING (
    id = public.user_agency_id()
    AND public.is_agency_admin()
  )
  WITH CHECK (
    id = public.user_agency_id()
    AND public.is_agency_admin()
  );

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON agencies TO authenticated;

-- ============================================================================
-- 5. POLÍTICAS RLS PARA properties
-- ============================================================================

DROP POLICY IF EXISTS "users_view_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_insert_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_update_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_delete_agency_properties" ON properties;

-- Ver propiedades de su agencia
CREATE POLICY "users_view_agency_properties"
  ON properties FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Crear propiedades para su agencia
CREATE POLICY "users_insert_agency_properties"
  ON properties FOR INSERT
  WITH CHECK (
    agency_id = public.user_agency_id()
    AND created_by = auth.uid()
  );

-- Actualizar propiedades de su agencia
CREATE POLICY "users_update_agency_properties"
  ON properties FOR UPDATE
  USING (agency_id = public.user_agency_id())
  WITH CHECK (agency_id = public.user_agency_id());

-- Eliminar propiedades de su agencia
CREATE POLICY "users_delete_agency_properties"
  ON properties FOR DELETE
  USING (agency_id = public.user_agency_id());

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;

-- ============================================================================
-- 6. POLÍTICAS RLS PARA contacts
-- ============================================================================

DROP POLICY IF EXISTS "users_view_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_insert_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_manage_agency_contacts" ON contacts;

-- Ver contactos de su agencia
CREATE POLICY "users_view_agency_contacts"
  ON contacts FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Crear contactos para su agencia
CREATE POLICY "users_insert_agency_contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    agency_id = public.user_agency_id()
    AND created_by = auth.uid()
  );

-- Actualizar/eliminar contactos de su agencia
CREATE POLICY "users_manage_agency_contacts"
  ON contacts FOR ALL
  USING (agency_id = public.user_agency_id())
  WITH CHECK (agency_id = public.user_agency_id());

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;

-- ============================================================================
-- 7. POLÍTICAS RLS PARA tasks
-- ============================================================================

DROP POLICY IF EXISTS "users_view_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "users_create_tasks" ON tasks;
DROP POLICY IF EXISTS "users_update_assigned_tasks" ON tasks;

-- Ver tareas asignadas a usuarios de su agencia
CREATE POLICY "users_view_assigned_tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = tasks.assigned_to
      AND user_profiles.agency_id = public.user_agency_id()
    )
  );

-- Crear tareas para usuarios de su agencia
CREATE POLICY "users_create_tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = tasks.assigned_to
      AND user_profiles.agency_id = public.user_agency_id()
    )
    AND created_by = auth.uid()
  );

-- Actualizar tareas de su agencia
CREATE POLICY "users_update_assigned_tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = tasks.assigned_to
      AND user_profiles.agency_id = public.user_agency_id()
    )
  );

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

-- ============================================================================
-- 8. POLÍTICAS RLS PARA contact_interactions (si existe)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_interactions') THEN
    
    EXECUTE 'DROP POLICY IF EXISTS "users_view_agency_interactions" ON contact_interactions';
    EXECUTE 'DROP POLICY IF EXISTS "users_create_interactions" ON contact_interactions';
    
    EXECUTE '
      CREATE POLICY "users_view_agency_interactions"
        ON contact_interactions FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_interactions.contact_id
            AND contacts.agency_id = public.user_agency_id()
          )
        )
    ';
    
    EXECUTE '
      CREATE POLICY "users_create_interactions"
        ON contact_interactions FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_interactions.contact_id
            AND contacts.agency_id = public.user_agency_id()
          )
          AND user_id = auth.uid()
        )
    ';
    
    EXECUTE 'ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'GRANT SELECT, INSERT ON contact_interactions TO authenticated';
    
    RAISE NOTICE 'Políticas RLS aplicadas a contact_interactions ✓';
  ELSE
    RAISE NOTICE 'Tabla contact_interactions no existe, omitiendo...';
  END IF;
END $$;

-- ============================================================================
-- 9. POLÍTICAS RLS PARA activity_logs (si existe)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_logs') THEN
    
    EXECUTE 'DROP POLICY IF EXISTS "users_view_agency_logs" ON activity_logs';
    EXECUTE 'DROP POLICY IF EXISTS "system_insert_logs" ON activity_logs';
    
    EXECUTE '
      CREATE POLICY "users_view_agency_logs"
        ON activity_logs FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = activity_logs.user_id
            AND user_profiles.agency_id = public.user_agency_id()
          )
        )
    ';
    
    EXECUTE '
      CREATE POLICY "system_insert_logs"
        ON activity_logs FOR INSERT
        WITH CHECK (true)
    ';
    
    EXECUTE 'ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'GRANT SELECT, INSERT ON activity_logs TO authenticated';
    
    RAISE NOTICE 'Políticas RLS aplicadas a activity_logs ✓';
  ELSE
    RAISE NOTICE 'Tabla activity_logs no existe, omitiendo...';
  END IF;
END $$;

-- ============================================================================
-- 10. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar funciones creadas
SELECT 
  '✓ Funciones helper creadas' as status,
  proname as function_name
FROM pg_proc 
WHERE proname IN ('user_agency_id', 'is_agency_admin')
  AND pronamespace = 'public'::regnamespace;

-- Verificar políticas creadas
SELECT 
  '✓ Políticas RLS activas' as status,
  schemaname,
  tablename,
  COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'agencies', 'properties', 'contacts', 'tasks')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verificar RLS habilitado
SELECT 
  '✓ RLS habilitado' as status,
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'agencies', 'properties', 'contacts', 'tasks')
ORDER BY tablename;

-- ============================================================================
-- MIGRACIÓN COMPLETADA ✓
-- ============================================================================
-- 
-- TABLAS PROTEGIDAS:
-- ✓ user_profiles (4 políticas)
-- ✓ agencies (2 políticas)
-- ✓ properties (4 políticas)
-- ✓ contacts (3 políticas)
-- ✓ tasks (3 políticas)
-- ✓ contact_interactions (si existe)
-- ✓ activity_logs (si existe)
--
-- FUNCIONES HELPER:
-- ✓ public.user_agency_id() - Obtiene agency_id del usuario
-- ✓ public.is_agency_admin() - Verifica si es admin/manager
--
-- ============================================================================
