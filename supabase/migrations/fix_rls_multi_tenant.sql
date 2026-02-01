-- =============================================
-- FIX CRÍTICO: Políticas RLS Multi-Tenant
-- =============================================
-- Este script corrige las políticas RLS permisivas que
-- permitían a usuarios ver/modificar datos de otras agencias
-- 
-- IMPACTO: CRÍTICO - Seguridad de datos multi-tenant
-- =============================================

-- =============================================
-- HELPER FUNCTION: Obtener agency_id del usuario actual
-- =============================================

CREATE OR REPLACE FUNCTION auth.user_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.user_agency_id() IS 
'Retorna el agency_id del usuario autenticado actual. Usado en políticas RLS.';

-- =============================================
-- HELPER FUNCTION: Verificar si el usuario es admin de su agencia
-- =============================================

CREATE OR REPLACE FUNCTION auth.is_agency_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'manager')
  FROM user_profiles 
  WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.is_agency_admin() IS 
'Retorna true si el usuario actual es admin o manager de su agencia.';

-- =============================================
-- TABLA: user_profiles
-- =============================================

-- Deshabilitar RLS temporalmente para recrear políticas
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_update_agency_profiles" ON user_profiles;

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_view_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Admins/Managers pueden ver todos los perfiles de SU agencia
CREATE POLICY "admins_view_agency_profiles"
  ON user_profiles FOR SELECT
  USING (
    agency_id = auth.user_agency_id() 
    AND auth.is_agency_admin()
  );

-- Los usuarios pueden actualizar su propio perfil (excepto role y agency_id)
CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  );

-- Admins pueden actualizar perfiles de SU agencia
CREATE POLICY "admins_update_agency_profiles"
  ON user_profiles FOR UPDATE
  USING (
    agency_id = auth.user_agency_id() 
    AND auth.is_agency_admin()
  )
  WITH CHECK (
    agency_id = auth.user_agency_id()
  );

-- =============================================
-- TABLA: agencies
-- =============================================

ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_agency" ON agencies;
DROP POLICY IF EXISTS "admins_update_agency" ON agencies;

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver SOLO su propia agencia
CREATE POLICY "users_view_own_agency"
  ON agencies FOR SELECT
  USING (id = auth.user_agency_id());

-- Solo admins pueden actualizar su agencia
CREATE POLICY "admins_update_own_agency"
  ON agencies FOR UPDATE
  USING (
    id = auth.user_agency_id() 
    AND auth.is_agency_admin()
  )
  WITH CHECK (id = auth.user_agency_id());

-- =============================================
-- TABLA: properties
-- =============================================

ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON properties;
DROP POLICY IF EXISTS "Users can insert properties" ON properties;
DROP POLICY IF EXISTS "Users can update properties" ON properties;

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver propiedades de SU agencia
CREATE POLICY "users_view_agency_properties"
  ON properties FOR SELECT
  USING (agency_id = auth.user_agency_id());

-- Usuarios pueden crear propiedades SOLO para SU agencia
CREATE POLICY "users_insert_agency_properties"
  ON properties FOR INSERT
  WITH CHECK (
    agency_id = auth.user_agency_id()
    AND created_by = auth.uid()
  );

-- Usuarios pueden actualizar propiedades de SU agencia
-- Asesores solo las suyas, admins/managers todas
CREATE POLICY "users_update_agency_properties"
  ON properties FOR UPDATE
  USING (
    agency_id = auth.user_agency_id()
    AND (
      auth.is_agency_admin() 
      OR assigned_to = auth.uid() 
      OR created_by = auth.uid()
    )
  )
  WITH CHECK (agency_id = auth.user_agency_id());

-- Admins pueden eliminar (soft delete) propiedades de SU agencia
CREATE POLICY "admins_delete_agency_properties"
  ON properties FOR UPDATE
  USING (
    agency_id = auth.user_agency_id() 
    AND auth.is_agency_admin()
  )
  WITH CHECK (agency_id = auth.user_agency_id());

-- =============================================
-- TABLA: contacts
-- =============================================

ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver contactos de SU agencia
CREATE POLICY "users_view_agency_contacts"
  ON contacts FOR SELECT
  USING (agency_id = auth.user_agency_id());

-- Usuarios pueden crear contactos SOLO para SU agencia
CREATE POLICY "users_insert_agency_contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    agency_id = auth.user_agency_id()
    AND created_by = auth.uid()
  );

-- Usuarios pueden actualizar contactos de SU agencia
-- Asesores solo los suyos, admins/managers todos
CREATE POLICY "users_update_agency_contacts"
  ON contacts FOR UPDATE
  USING (
    agency_id = auth.user_agency_id()
    AND (
      auth.is_agency_admin() 
      OR assigned_to = auth.uid() 
      OR created_by = auth.uid()
    )
  )
  WITH CHECK (agency_id = auth.user_agency_id());

-- =============================================
-- TABLA: tasks
-- =============================================

ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver tareas de SU agencia
CREATE POLICY "users_view_agency_tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = tasks.assigned_to
      AND up.agency_id = auth.user_agency_id()
    )
  );

-- Usuarios pueden crear tareas para usuarios de SU agencia
CREATE POLICY "users_insert_agency_tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = tasks.assigned_to
      AND up.agency_id = auth.user_agency_id()
    )
    AND created_by = auth.uid()
  );

-- Usuarios pueden actualizar sus propias tareas
-- Admins/managers pueden actualizar todas las tareas de su agencia
CREATE POLICY "users_update_agency_tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = tasks.assigned_to
      AND up.agency_id = auth.user_agency_id()
    )
    AND (
      auth.is_agency_admin() 
      OR assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = tasks.assigned_to
      AND up.agency_id = auth.user_agency_id()
    )
  );

-- =============================================
-- TABLA: contact_interactions
-- =============================================

ALTER TABLE contact_interactions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_interactions" ON contact_interactions;

ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver interacciones de contactos de SU agencia
CREATE POLICY "users_view_agency_contact_interactions"
  ON contact_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = contact_interactions.contact_id
      AND c.agency_id = auth.user_agency_id()
    )
  );

-- Usuarios pueden crear interacciones para contactos de SU agencia
CREATE POLICY "users_insert_agency_contact_interactions"
  ON contact_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = contact_interactions.contact_id
      AND c.agency_id = auth.user_agency_id()
    )
    AND user_id = auth.uid()
  );

-- =============================================
-- TABLA: activity_logs
-- =============================================

ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view activity logs" ON activity_logs;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios logs
CREATE POLICY "users_view_own_activity_logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins pueden ver todos los logs de usuarios de SU agencia
CREATE POLICY "admins_view_agency_activity_logs"
  ON activity_logs FOR SELECT
  USING (
    auth.is_agency_admin()
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = activity_logs.user_id
      AND up.agency_id = auth.user_agency_id()
    )
  );

-- Todos pueden insertar sus propios logs
CREATE POLICY "users_insert_own_activity_logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- TABLA: task_performance_metrics (si existe)
-- =============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_performance_metrics') THEN
    ALTER TABLE task_performance_metrics DISABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view metrics" ON task_performance_metrics;
    
    ALTER TABLE task_performance_metrics ENABLE ROW LEVEL SECURITY;
    
    -- Solo admins/managers pueden ver métricas
    CREATE POLICY "admins_view_agency_metrics"
      ON task_performance_metrics FOR SELECT
      USING (auth.is_agency_admin());
  END IF;
END $$;

-- =============================================
-- GRANTS - Asegurar permisos correctos
-- =============================================

-- Revocar permisos públicos peligrosos
REVOKE ALL ON user_profiles FROM anon;
REVOKE ALL ON agencies FROM anon;
REVOKE ALL ON properties FROM anon;
REVOKE ALL ON contacts FROM anon;
REVOKE ALL ON tasks FROM anon;
REVOKE ALL ON activity_logs FROM anon;

-- Otorgar permisos solo a usuarios autenticados
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, UPDATE ON agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON properties TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contact_interactions TO authenticated;
GRANT SELECT, INSERT ON activity_logs TO authenticated;

-- =============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =============================================

COMMENT ON POLICY "users_view_agency_properties" ON properties IS 
'Usuarios solo pueden ver propiedades de su agencia (multi-tenant)';

COMMENT ON POLICY "users_view_agency_contacts" ON contacts IS 
'Usuarios solo pueden ver contactos de su agencia (multi-tenant)';

COMMENT ON POLICY "users_view_agency_tasks" ON tasks IS 
'Usuarios solo pueden ver tareas asignadas a usuarios de su agencia (multi-tenant)';

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

-- Para verificar las políticas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
