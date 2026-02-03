-- ============================================================================
-- SETUP COMPLETO: Columnas + RLS Multi-Tenant
-- ============================================================================
-- Este script:
-- 1. Agrega columnas faltantes de manera segura
-- 2. Crea funciones helper
-- 3. Aplica políticas RLS correctas
-- ============================================================================

-- ============================================================================
-- PARTE 1: AGREGAR COLUMNAS FALTANTES
-- ============================================================================

-- Agregar created_by a properties (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE properties ADD COLUMN created_by UUID REFERENCES auth.users(id);
    RAISE NOTICE '✓ Columna created_by agregada a properties';
  ELSE
    RAISE NOTICE '→ Columna created_by ya existe en properties';
  END IF;
END $$;

-- Agregar assigned_to a properties (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE properties ADD COLUMN assigned_to UUID REFERENCES user_profiles(id);
    RAISE NOTICE '✓ Columna assigned_to agregada a properties';
  ELSE
    RAISE NOTICE '→ Columna assigned_to ya existe en properties';
  END IF;
END $$;

-- Agregar created_by a contacts (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE contacts ADD COLUMN created_by UUID REFERENCES auth.users(id);
    RAISE NOTICE '✓ Columna created_by agregada a contacts';
  ELSE
    RAISE NOTICE '→ Columna created_by ya existe en contacts';
  END IF;
END $$;

-- Agregar assigned_to a contacts (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE contacts ADD COLUMN assigned_to UUID REFERENCES user_profiles(id);
    RAISE NOTICE '✓ Columna assigned_to agregada a contacts';
  ELSE
    RAISE NOTICE '→ Columna assigned_to ya existe en contacts';
  END IF;
END $$;

-- Agregar created_by a tasks (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN created_by UUID REFERENCES auth.users(id);
    RAISE NOTICE '✓ Columna created_by agregada a tasks';
  ELSE
    RAISE NOTICE '→ Columna created_by ya existe en tasks';
  END IF;
END $$;

-- ============================================================================
-- PARTE 2: ELIMINAR POLÍTICAS Y FUNCIONES ANTERIORES
-- ============================================================================

-- Eliminar funciones anteriores
DROP FUNCTION IF EXISTS auth.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS auth.is_agency_admin() CASCADE;
DROP FUNCTION IF EXISTS public.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_agency_admin() CASCADE;

-- Eliminar políticas anteriores de user_profiles
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_view_agency_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_manage_agency_profiles" ON user_profiles;

-- Eliminar políticas anteriores de agencies
DROP POLICY IF EXISTS "users_view_own_agency" ON agencies;
DROP POLICY IF EXISTS "admins_update_own_agency" ON agencies;

-- Eliminar políticas anteriores de properties
DROP POLICY IF EXISTS "users_view_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_insert_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_update_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_delete_agency_properties" ON properties;

-- Eliminar políticas anteriores de contacts
DROP POLICY IF EXISTS "users_view_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_insert_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_manage_agency_contacts" ON contacts;

-- Eliminar políticas anteriores de tasks
DROP POLICY IF EXISTS "users_view_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "users_create_tasks" ON tasks;
DROP POLICY IF EXISTS "users_update_assigned_tasks" ON tasks;

-- ============================================================================
-- PARTE 3: CREAR FUNCIONES HELPER
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

-- Función para verificar si el usuario es admin/manager
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
'Verifica si el usuario es admin o manager de su agencia';

-- ============================================================================
-- PARTE 4: POLÍTICAS RLS PARA user_profiles
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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- ============================================================================
-- PARTE 5: POLÍTICAS RLS PARA agencies
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

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON agencies TO authenticated;

-- ============================================================================
-- PARTE 6: POLÍTICAS RLS PARA properties
-- ============================================================================

-- Ver propiedades de su agencia
CREATE POLICY "users_view_agency_properties"
  ON properties FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Crear propiedades (sin validar created_by si no existe el usuario)
CREATE POLICY "users_insert_agency_properties"
  ON properties FOR INSERT
  WITH CHECK (agency_id = public.user_agency_id());

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
-- PARTE 7: POLÍTICAS RLS PARA contacts
-- ============================================================================

-- Ver contactos de su agencia
CREATE POLICY "users_view_agency_contacts"
  ON contacts FOR SELECT
  USING (agency_id = public.user_agency_id());

-- Crear contactos para su agencia
CREATE POLICY "users_insert_agency_contacts"
  ON contacts FOR INSERT
  WITH CHECK (agency_id = public.user_agency_id());

-- Actualizar/eliminar contactos de su agencia
CREATE POLICY "users_manage_agency_contacts"
  ON contacts FOR ALL
  USING (agency_id = public.user_agency_id())
  WITH CHECK (agency_id = public.user_agency_id());

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;

-- ============================================================================
-- PARTE 8: POLÍTICAS RLS PARA tasks
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
-- PARTE 9: TRIGGERS PARA AUTO-ASIGNAR created_by
-- ============================================================================

-- Trigger para properties
CREATE OR REPLACE FUNCTION set_created_by_properties()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_created_by_properties ON properties;
CREATE TRIGGER trigger_set_created_by_properties
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by_properties();

-- Trigger para contacts
CREATE OR REPLACE FUNCTION set_created_by_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_created_by_contacts ON contacts;
CREATE TRIGGER trigger_set_created_by_contacts
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by_contacts();

-- Trigger para tasks
CREATE OR REPLACE FUNCTION set_created_by_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_created_by_tasks ON tasks;
CREATE TRIGGER trigger_set_created_by_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by_tasks();

-- ============================================================================
-- PARTE 10: VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar funciones
SELECT 
  '✓ Funciones helper' as status,
  proname as function_name
FROM pg_proc 
WHERE proname IN ('user_agency_id', 'is_agency_admin')
  AND pronamespace = 'public'::regnamespace;

-- Verificar columnas agregadas
SELECT 
  '✓ Columnas verificadas' as status,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('properties', 'contacts', 'tasks')
  AND column_name IN ('created_by', 'assigned_to')
ORDER BY table_name, column_name;

-- Verificar políticas
SELECT 
  '✓ Políticas RLS' as status,
  tablename,
  COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'agencies', 'properties', 'contacts', 'tasks')
GROUP BY tablename
ORDER BY tablename;

-- Verificar RLS habilitado
SELECT 
  '✓ RLS habilitado' as status,
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'agencies', 'properties', 'contacts', 'tasks')
ORDER BY tablename;

-- Verificar triggers
SELECT 
  '✓ Triggers creados' as status,
  trigger_name,
  event_object_table as table_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_set_created_by%'
ORDER BY event_object_table;

-- ============================================================================
-- SETUP COMPLETADO ✓
-- ============================================================================
-- 
-- ✓ Columnas agregadas: created_by, assigned_to
-- ✓ Funciones helper: user_agency_id(), is_agency_admin()
-- ✓ Políticas RLS: 16 políticas en 5 tablas
-- ✓ Triggers: Auto-asignación de created_by
-- ✓ RLS habilitado en todas las tablas core
--
-- AISLAMIENTO MULTI-TENANT: ACTIVO
-- ============================================================================
