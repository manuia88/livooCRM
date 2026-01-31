-- ============================================================================
-- LIVOO CRM - SISTEMA MULTI-TENANT BASE
-- Migration: 0001_multi_tenant_base.sql
-- Descripción: Agencies, User Profiles, Roles y RLS Policies
-- ============================================================================

-- ============================================================================
-- TABLA 1: agencies (Inmobiliarias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Contacto
  email TEXT,
  phone TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_active ON agencies(is_active);

-- ============================================================================
-- TABLA 2: user_profiles (Usuarios del sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Relación con agencia
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  
  -- Información personal
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  
  -- Rol y permisos
  role TEXT NOT NULL DEFAULT 'asesor' CHECK (role IN ('admin', 'director', 'asesor')),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(email),
  UNIQUE(agency_id, email)
);

-- Índices
CREATE INDEX idx_user_profiles_agency ON user_profiles(agency_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- ============================================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_agencies_updated_at 
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: agencies
-- ============================================================================

-- Los usuarios pueden ver su propia agencia
CREATE POLICY "users_view_own_agency"
  ON agencies FOR SELECT
  USING (
    id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  );

-- Solo admins pueden actualizar su agencia
CREATE POLICY "admins_update_agency"
  ON agencies FOR UPDATE
  USING (
    id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- POLICIES: user_profiles
-- ============================================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_view_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Admins/Directores ven todos los perfiles de su agencia
CREATE POLICY "admins_view_all_profiles"
  ON user_profiles FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'director')
  );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins pueden actualizar perfiles de su agencia
CREATE POLICY "admins_update_agency_profiles"
  ON user_profiles FOR UPDATE
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'director')
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;

-- ============================================================================
-- DATOS DE PRUEBA (Inmobiliaria demo)
-- ============================================================================

INSERT INTO agencies (id, name, slug, email, phone) 
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Bienes Raíces Premium',
  'bienes-raices-premium',
  'admin@bienesraices.com',
  '+52 55 1234 5678'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE agencies IS 'Inmobiliarias registradas en el sistema';
COMMENT ON TABLE user_profiles IS 'Usuarios del sistema (admins, directores, asesores)';
COMMENT ON COLUMN user_profiles.role IS 'admin = ve TODO, director = ve TODO, asesor = ve solo lo suyo';
