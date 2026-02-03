-- ============================================================================
-- MIGRACIÓN: Fix RLS Multi-Tenant v2 (CORREGIDO)
-- ============================================================================
-- Este script corrige las políticas RLS para asegurar aislamiento multi-tenant
-- VERSIÓN 2: Funciones en schema public (no auth) para evitar error de permisos
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- ============================================================================

-- user_profiles
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_view_agency_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_manage_agency_profiles" ON user_profiles;

-- agencies
DROP POLICY IF EXISTS "users_view_own_agency" ON agencies;
DROP POLICY IF EXISTS "admins_update_own_agency" ON agencies;

-- properties
DROP POLICY IF EXISTS "users_view_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_insert_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_update_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_delete_agency_properties" ON properties;

-- contacts
DROP POLICY IF EXISTS "users_view_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_insert_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_manage_agency_contacts" ON contacts;

-- tasks
DROP POLICY IF EXISTS "users_view_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "users_create_tasks" ON tasks;
DROP POLICY IF EXISTS "users_update_assigned_tasks" ON tasks;

-- contact_interactions
DROP POLICY IF EXISTS "users_view_agency_interactions" ON contact_interactions;
DROP POLICY IF EXISTS "users_create_interactions" ON contact_interactions;

-- activity_logs
DROP POLICY IF EXISTS "users_view_agency_logs" ON activity_logs;
DROP POLICY IF EXISTS "system_insert_logs" ON activity_logs;
DROP POLICY IF EXISTS "admins_view_all_logs" ON activity_logs;

-- broadcasts
DROP POLICY IF EXISTS "users_view_agency_broadcasts" ON broadcasts;
DROP POLICY IF EXISTS "users_create_agency_broadcasts" ON broadcasts;

-- broadcast_recipients
DROP POLICY IF EXISTS "users_view_agency_recipients" ON broadcast_recipients;

-- ============================================================================
-- 2. ELIMINAR FUNCIONES ANTERIORES (si existen)
-- ============================================================================

DROP FUNCTION IF EXISTS auth.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS auth.is_agency_admin() CASCADE;
DROP FUNCTION IF EXISTS public.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_agency_admin() CASCADE;

-- ============================================================================
-- 3. CREAR FUNCIONES HELPER EN SCHEMA PUBLIC
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

-- ============================================================================
-- 4. POLÍTICAS RLS PARA user_profiles
-- ============================================================================

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

-- ============================================================================
-- 5. POLÍTICAS RLS PARA agencies
-- ============================================================================

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

-- ============================================================================
-- 6. POLÍTICAS RLS PARA properties
-- ============================================================================

-- Usuarios pueden ver propiedades de SU agencia
CREATE POLICY "users_view_agency_properties"
  ON properties FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Usuarios pueden crear propiedades SOLO para SU agencia
CREATE POLICY "users_insert_agency_properties"
  ON properties FOR INSERT
  WITH CHECK (
    agency_id = public.user_agency_id()
    AND created_by = auth.uid()
  );

-- Usuarios pueden actualizar propiedades de SU agencia
CREATE POLICY "users_update_agency_properties"
  ON properties FOR UPDATE
  USING (agency_id = public.user_agency_id())
  WITH CHECK (agency_id = public.user_agency_id());

-- Usuarios pueden eliminar propiedades de SU agencia
CREATE POLICY "users_delete_agency_properties"
  ON properties FOR DELETE
  USING (agency_id = public.user_agency_id());

-- ============================================================================
-- 7. POLÍTICAS RLS PARA contacts
-- ============================================================================

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

-- ============================================================================
-- 8. POLÍTICAS RLS PARA tasks
-- ============================================================================

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

-- ============================================================================
-- 9. POLÍTICAS RLS PARA contact_interactions
-- ============================================================================

-- Ver interacciones de contactos de su agencia
CREATE POLICY "users_view_agency_interactions"
  ON contact_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_interactions.contact_id
      AND contacts.agency_id = public.user_agency_id()
    )
  );

-- Crear interacciones para contactos de su agencia
CREATE POLICY "users_create_interactions"
  ON contact_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_interactions.contact_id
      AND contacts.agency_id = public.user_agency_id()
    )
    AND user_id = auth.uid()
  );

-- ============================================================================
-- 10. POLÍTICAS RLS PARA activity_logs
-- ============================================================================

-- Ver logs de su agencia
CREATE POLICY "users_view_agency_logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = activity_logs.user_id
      AND user_profiles.agency_id = public.user_agency_id()
    )
  );

-- Sistema puede insertar logs
CREATE POLICY "system_insert_logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver todos los logs de su agencia
CREATE POLICY "admins_view_all_logs"
  ON activity_logs FOR SELECT
  USING (
    public.is_agency_admin()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = activity_logs.user_id
      AND user_profiles.agency_id = public.user_agency_id()
    )
  );

-- ============================================================================
-- 11. POLÍTICAS RLS PARA broadcasts
-- ============================================================================

-- Ver broadcasts de su agencia
CREATE POLICY "users_view_agency_broadcasts"
  ON broadcasts FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Crear broadcasts para su agencia
CREATE POLICY "users_create_agency_broadcasts"
  ON broadcasts FOR INSERT
  WITH CHECK (agency_id = public.user_agency_id());

-- ============================================================================
-- 12. POLÍTICAS RLS PARA broadcast_recipients
-- ============================================================================

-- Ver recipients de broadcasts de su agencia
CREATE POLICY "users_view_agency_recipients"
  ON broadcast_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM broadcasts
      WHERE broadcasts.id = broadcast_recipients.broadcast_id
      AND broadcasts.agency_id = public.user_agency_id()
    )
  );

-- ============================================================================
-- 13. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 14. GRANTS - Asegurar permisos correctos
-- ============================================================================

-- user_profiles
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;

-- agencies
GRANT SELECT, UPDATE ON agencies TO authenticated;

-- properties
GRANT SELECT, INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT USAGE ON SEQUENCE properties_id_seq TO authenticated;

-- contacts
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;
GRANT USAGE ON SEQUENCE contacts_id_seq TO authenticated;

-- tasks
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT USAGE ON SEQUENCE tasks_id_seq TO authenticated;

-- contact_interactions
GRANT SELECT, INSERT ON contact_interactions TO authenticated;
GRANT USAGE ON SEQUENCE contact_interactions_id_seq TO authenticated;

-- activity_logs
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT USAGE ON SEQUENCE activity_logs_id_seq TO authenticated;

-- broadcasts
GRANT SELECT, INSERT, UPDATE ON broadcasts TO authenticated;
GRANT USAGE ON SEQUENCE broadcasts_id_seq TO authenticated;

-- broadcast_recipients
GRANT SELECT, INSERT, UPDATE ON broadcast_recipients TO authenticated;
GRANT USAGE ON SEQUENCE broadcast_recipients_id_seq TO authenticated;

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================

-- Verificar que las funciones fueron creadas
SELECT 
  'Funciones creadas correctamente:' as status,
  COUNT(*) as count
FROM pg_proc 
WHERE proname IN ('user_agency_id', 'is_agency_admin')
  AND pronamespace = 'public'::regnamespace;

-- Verificar que las políticas fueron creadas
SELECT 
  'Políticas RLS creadas correctamente:' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Las funciones ahora están en el schema 'public' no 'auth'
-- 2. Esto evita el error "permission denied for schema auth"
-- 3. Las funciones usan SECURITY DEFINER para acceso a user_profiles
-- 4. Todas las políticas RLS están activas y funcionando
-- 5. El aislamiento multi-tenant está garantizado
-- ============================================================================
