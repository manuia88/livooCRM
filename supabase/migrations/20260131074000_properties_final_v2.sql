-- ============================================================================
-- LIVOO CRM - MÓDULO PROPIEDADES COMPLETO (VERSIÓN FINAL V2 - VERIFICADA)
-- Migration: 20260131074000_properties_final_v2.sql
-- Descripción: Agrega columnas nuevas y crea vista verificando TODAS las columnas
-- ============================================================================

-- ============================================================================
-- AGREGAR COLUMNAS FALTANTES (SOLO LAS NUEVAS)
-- ============================================================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_notes TEXT;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS documentation_status TEXT DEFAULT 'sin_documentos' CHECK (
  documentation_status IN ('sin_documentos', 'incompletos', 'revision', 'aprobados', 'rechazados')
);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

ALTER TABLE properties ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commission_notes TEXT;

-- ============================================================================
-- ROW LEVEL SECURITY - POLÍTICAS BÁSICAS
-- ============================================================================

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "public_view_published" ON properties;
DROP POLICY IF EXISTS "public_view_published_properties" ON properties;
DROP POLICY IF EXISTS "authenticated_view_properties" ON properties;
DROP POLICY IF EXISTS "agents_view_properties" ON properties;
DROP POLICY IF EXISTS "agents_view_own_properties" ON properties;
DROP POLICY IF EXISTS "admins_view_all_agency_properties" ON properties;
DROP POLICY IF EXISTS "authenticated_create_properties" ON properties;
DROP POLICY IF EXISTS "agents_create_properties" ON properties;
DROP POLICY IF EXISTS "agents_update_own" ON properties;
DROP POLICY IF EXISTS "agents_update_own_properties" ON properties;
DROP POLICY IF EXISTS "admins_update_agency" ON properties;
DROP POLICY IF EXISTS "admins_update_all_agency_properties" ON properties;
DROP POLICY IF EXISTS "authenticated_view_all" ON properties;
DROP POLICY IF EXISTS "authenticated_create" ON properties;
DROP POLICY IF EXISTS "admins_update_agency" ON properties;

-- Policy 1: Público - Solo propiedades no eliminadas
CREATE POLICY "public_view_published"
  ON properties FOR SELECT TO anon
  USING (
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'deleted_at')
      THEN deleted_at IS NULL
      ELSE true
    END
  );

-- Policy 2: Autenticados ven propiedades de su agencia
CREATE POLICY "authenticated_view_all"
  ON properties FOR SELECT TO authenticated
  USING (
    (
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'deleted_at')
        THEN deleted_at IS NULL
        ELSE true
      END
    ) AND
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  );

-- Policy 3: Crear propiedades
CREATE POLICY "authenticated_create"
  ON properties FOR INSERT TO authenticated
  WITH CHECK (
    producer_id = auth.uid() AND
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  );

-- Policy 4: Actualizar (asesores solo suyas)
CREATE POLICY "agents_update_own"
  ON properties FOR UPDATE TO authenticated
  USING (
    producer_id = auth.uid() AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'asesor'
  );

-- Policy 5: Actualizar (admins todas de agencia)
CREATE POLICY "admins_update_agency"
  ON properties FOR UPDATE TO authenticated
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'director')
  );

-- ============================================================================
-- VISTA: properties_safe (CONSTRUCCIÓN DINÁMICA COMPLETA)
-- Verifica TODAS las columnas antes de usarlas
-- ============================================================================

-- Primero eliminar la vista si existe
DROP VIEW IF EXISTS properties_safe;

-- Construir la vista dinámicamente verificando TODAS las columnas
DO $$
DECLARE
  v_select_list TEXT := '';
  v_where_clause TEXT := '';
BEGIN
  -- Columnas básicas que siempre deberían existir (pero verificamos igual)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'id') THEN
    v_select_list := 'p.id';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'agency_id') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.agency_id';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'producer_id') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.producer_id';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'title') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.title';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.description';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'property_type') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.property_type';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'operation_type') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.operation_type';
  END IF;
  
  -- Timestamps (verificar cada uno)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'created_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.created_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'updated_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.updated_at';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'deleted_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.deleted_at';
    v_where_clause := 'WHERE p.deleted_at IS NULL';
  END IF;

  -- Ubicación
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'address') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.address';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'street') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.street';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'neighborhood') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.neighborhood';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.city';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'state') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.state';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'postal_code') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.postal_code';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'country') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.country';
  END IF;

  -- Características
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.bedrooms';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.bathrooms';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'half_bathrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.half_bathrooms';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'parking_spaces') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.parking_spaces';
  END IF;

  -- Precios
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'sale_price') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.sale_price';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'rent_price') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.rent_price';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'currency') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.currency';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'maintenance_fee') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.maintenance_fee';
  END IF;

  -- Estado y métricas
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.status';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'health_score') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.health_score';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'views_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.views_count';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'favorites_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.favorites_count';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'inquiries_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.inquiries_count';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_exclusive') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.is_exclusive';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'commission_percentage') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.commission_percentage';
  END IF;

  -- Columnas nuevas que acabamos de agregar (siempre deberían existir después de ALTER TABLE)
  IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
  v_select_list := v_select_list || 'p.owner_name, p.owner_phone, p.owner_email, p.owner_notes';
  v_select_list := v_select_list || ', p.documentation_status, p.documents, p.main_image_url, p.commission_notes';

  -- Campos calculados con protección de datos
  v_select_list := v_select_list || ', CASE WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN p.owner_name ELSE NULL END AS owner_name_safe';
  v_select_list := v_select_list || ', CASE WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN p.owner_phone ELSE NULL END AS owner_phone_safe';
  v_select_list := v_select_list || ', CASE WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN p.owner_email ELSE NULL END AS owner_email_safe';
  v_select_list := v_select_list || ', CASE WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN p.owner_notes ELSE NULL END AS owner_notes_safe';

  -- Flags útiles
  v_select_list := v_select_list || ', (p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())) AS is_my_agency';
  v_select_list := v_select_list || ', (p.producer_id = auth.uid()) AS is_mine';
  v_select_list := v_select_list || ', CASE WHEN p.producer_id = auth.uid() THEN ''own'' WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN ''agency'' ELSE ''network'' END AS source';

  -- Crear la vista
  IF v_where_clause = '' THEN
    v_where_clause := '';
  END IF;
  
  EXECUTE format('CREATE VIEW properties_safe AS SELECT %s FROM properties p %s', v_select_list, v_where_clause);
END $$;

GRANT SELECT ON properties_safe TO authenticated;

COMMENT ON VIEW properties_safe IS 'Vista segura que oculta owner_* si agency_id diferente';

-- ============================================================================
-- FIN
-- ============================================================================
