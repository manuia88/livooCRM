-- =====================================================
-- FIX RLS POLICIES - MULTI-TENANT SECURITY
-- Migration: 20260209000000_fix_rls_policies.sql
-- Description: Corrects critical security bug where users
-- could see all data. Implements agency isolation and
-- role-based access for admins, managers, and agents.
-- =====================================================

BEGIN;

-- 1. HELPER FUNCTIONS
-- These functions are SECURITY DEFINER to ensure they can 
-- access user_profiles even when RLS is enabled.

-- Function to get the current user's agency_id
CREATE OR REPLACE FUNCTION auth.get_user_agency_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT agency_id 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION auth.get_user_agency_id() IS 'Returns the agency_id of the currently authenticated user.';

-- Function to check if the current user is an admin or manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  );
$$;

COMMENT ON FUNCTION auth.is_admin_or_manager() IS 'Returns true if the current user has admin or manager role.';


-- 2. DROP INSECURE POLICIES
-- Clean up all existing policies on critical tables to ensure a clean slate.

-- properties
DROP POLICY IF EXISTS "Users can view all properties" ON properties;
DROP POLICY IF EXISTS "Users can insert properties" ON properties;
DROP POLICY IF EXISTS "Users can update properties" ON properties;
DROP POLICY IF EXISTS "Users can delete properties" ON properties;
DROP POLICY IF EXISTS "public_view_published" ON properties;
DROP POLICY IF EXISTS "authenticated_view_all" ON properties;
DROP POLICY IF EXISTS "authenticated_create" ON properties;
DROP POLICY IF EXISTS "agents_update_own" ON properties;
DROP POLICY IF EXISTS "admins_update_agency" ON properties;
DROP POLICY IF EXISTS "users_view_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_insert_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_update_agency_properties" ON properties;
DROP POLICY IF EXISTS "users_delete_agency_properties" ON properties;

-- contacts
DROP POLICY IF EXISTS "Users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;
DROP POLICY IF EXISTS "users_view_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_insert_agency_contacts" ON contacts;
DROP POLICY IF EXISTS "users_manage_agency_contacts" ON contacts;

-- tasks
DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users see tasks from their agency" ON tasks;
DROP POLICY IF EXISTS "Users create tasks for their agency" ON tasks;
DROP POLICY IF EXISTS "Users update tasks from their agency" ON tasks;
DROP POLICY IF EXISTS "users_view_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "users_create_tasks" ON tasks;
DROP POLICY IF EXISTS "users_update_assigned_tasks" ON tasks;

-- contact_interactions
DROP POLICY IF EXISTS "Users can view all interactions" ON contact_interactions;
DROP POLICY IF EXISTS "Users can insert interactions" ON contact_interactions;

-- property_views
DROP POLICY IF EXISTS "Users can view all views" ON property_views;
DROP POLICY IF EXISTS "Users can insert views" ON property_views;

-- user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view same agency profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins have full access" ON user_profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_view_agency_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admins_manage_agency_profiles" ON user_profiles;


-- 3. APPLY NEW POLICIES

-- =====================================================
-- TABLE: properties
-- =====================================================

-- SELECT: Admins/Managers see all agency properties. Agents see assigned or produced properties.
CREATE POLICY "properties_select_policy"
ON properties FOR SELECT
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR producer_id = auth.uid()
    OR assigned_to = auth.uid()
  )
);

-- INSERT: Any authenticated user can create properties for their agency.
CREATE POLICY "properties_insert_policy"
ON properties FOR INSERT
TO authenticated
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);

-- UPDATE: Admins/Managers can update any agency property. Agents can update if they are the producer.
CREATE POLICY "properties_update_policy"
ON properties FOR UPDATE
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR producer_id = auth.uid()
  )
)
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);

-- DELETE: Only admins and managers can delete properties.
CREATE POLICY "properties_delete_policy"
ON properties FOR DELETE
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND auth.is_admin_or_manager()
);


-- =====================================================
-- TABLE: contacts
-- =====================================================

-- SELECT: Admins/Managers see all agency contacts. Agents see assigned contacts.
CREATE POLICY "contacts_select_policy"
ON contacts FOR SELECT
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR assigned_to = auth.uid()
  )
);

-- INSERT: Users can create contacts for their agency.
CREATE POLICY "contacts_insert_policy"
ON contacts FOR INSERT
TO authenticated
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);

-- UPDATE: Admins/Managers can update any contact. Agents can update assigned contacts.
CREATE POLICY "contacts_update_policy"
ON contacts FOR UPDATE
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR assigned_to = auth.uid()
  )
)
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);

-- DELETE: Only admins and managers can delete contacts.
CREATE POLICY "contacts_delete_policy"
ON contacts FOR DELETE
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND auth.is_admin_or_manager()
);


-- =====================================================
-- TABLE: tasks
-- =====================================================

-- SELECT: Agency-wide for admins. Specific for users.
CREATE POLICY "tasks_select_policy"
ON tasks FOR SELECT
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

-- INSERT/UPDATE: Restrict to agency.
CREATE POLICY "tasks_insert_policy"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);

CREATE POLICY "tasks_update_policy"
ON tasks FOR UPDATE
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
  AND (
    auth.is_admin_or_manager()
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
)
WITH CHECK (
  agency_id = auth.get_user_agency_id()
);


-- =====================================================
-- TABLE: contact_interactions
-- =====================================================

-- SELECT: View interacciones of contacts the user can see.
CREATE POLICY "interactions_select_policy"
ON contact_interactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_interactions.contact_id
    AND contacts.agency_id = auth.get_user_agency_id()
    AND (
      auth.is_admin_or_manager()
      OR contacts.assigned_to = auth.uid()
    )
  )
);

-- INSERT: Allow creating interactions for visible contacts.
CREATE POLICY "interactions_insert_policy"
ON contact_interactions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_interactions.contact_id
    AND contacts.agency_id = auth.get_user_agency_id()
  )
);

-- No update/delete for interactions (history log)


-- =====================================================
-- TABLE: property_views
-- =====================================================

-- SELECT: View visits of properties the user can see.
CREATE POLICY "property_views_select_policy"
ON property_views FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_views.property_id
    AND properties.agency_id = auth.get_user_agency_id()
    AND (
      auth.is_admin_or_manager()
      OR properties.producer_id = auth.uid()
      OR properties.assigned_to = auth.uid()
    )
  )
);

-- INSERT: Allow registering views.
CREATE POLICY "property_views_insert_policy"
ON property_views FOR INSERT
TO authenticated
WITH CHECK (true); -- Usually public or from agent/contact activity


-- =====================================================
-- TABLE: user_profiles
-- =====================================

-- Users can see all profiles in their agency (for team collaboration)
CREATE POLICY "user_profiles_select_policy"
ON user_profiles FOR SELECT
TO authenticated
USING (
  agency_id = auth.get_user_agency_id()
);

-- Users can only update their own profile, or admins can update anyone in the agency.
CREATE POLICY "user_profiles_update_policy"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  (id = auth.uid())
  OR (
    agency_id = auth.get_user_agency_id()
    AND auth.is_admin_or_manager()
  )
)
WITH CHECK (
  (id = auth.uid() AND agency_id = auth.get_user_agency_id()) -- Cannot change agency
  OR (auth.is_admin_or_manager())
);


-- 4. ENABLE RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

COMMIT;
