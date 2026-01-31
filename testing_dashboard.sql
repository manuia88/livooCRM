-- ============================================================================
-- LIVOO CRM - REPARACIÓN Y CARGA DE DATOS (DASHBOARD) - VERSIÓN FINAL
-- Archivo: testing_dashboard.sql
-- Descripción: Repara el esquema faltante y carga datos de prueba para el Dashboard
-- ============================================================================

-- 1. REPARACIÓN DE ESQUEMA (Asegura columnas requeridas por el código)

-- properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS agency_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
ADD COLUMN IF NOT EXISTS producer_id UUID,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS operation_type TEXT CHECK (operation_type IN ('sale', 'rent', 'both')),
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS rent_price NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS construction_m2 NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Remove NOT NULL constraint from type and listing_type columns if they exist
ALTER TABLE properties ALTER COLUMN type DROP NOT NULL;
ALTER TABLE properties ALTER COLUMN listing_type DROP NOT NULL;

-- operations (Tabla faltante en migrations pero requerida por useDashboard.ts)
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id),
    property_id UUID REFERENCES properties(id),
    contact_id UUID REFERENCES contacts(id),
    producer_id UUID REFERENCES user_profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    sale_price NUMERIC(15,2),
    closing_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CARGA DE DATOS DE PRUEBA

-- Agencia Default
INSERT INTO agencies (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Livoo Real Estate', 'livoo')
ON CONFLICT (id) DO NOTHING;

-- Perfiles de Prueba
INSERT INTO user_profiles (id, agency_id, first_name, role, is_active)
VALUES 
('2a2453d0-08ad-4e4d-8cfb-142eebf80952', '00000000-0000-0000-0000-000000000001', 'María', 'admin', true),
('483ea6a0-09b9-4763-8ad0-dab546418ff8', '00000000-0000-0000-0000-000000000001', 'Carlos', 'asesor', true),
('53520333-3303-4ae9-a3b4-c8207ae8c744', '00000000-0000-0000-0000-000000000001', 'Laura', 'asesor', true)
ON CONFLICT (id) DO UPDATE SET agency_id = EXCLUDED.agency_id;

-- Propiedades (Asegurando que coinciden con las columnas del ALTER TABLE)
INSERT INTO properties (agency_id, producer_id, title, status, operation_type, sale_price, price, property_type, city, state)
VALUES 
('00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'Casa Polanco', 'disponible', 'sale', 15500000, 15500000, 'house', 'CDMX', 'Polanco'),
('00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'Depto Roma', 'disponible', 'rent', 25000, 25000, 'apartment', 'CDMX', 'Roma Norte'),
('00000000-0000-0000-0000-000000000001', '53520333-3303-4ae9-a3b4-c8207ae8c744', 'PH Condesa', 'disponible', 'sale', 18900000, 18900000, 'apartment', 'CDMX', 'Condesa');

-- Contactos
INSERT INTO contacts (agency_id, assigned_to, first_name, last_name, contact_type, status)
VALUES 
('00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'Juan', 'Perez', 'buyer', 'qualified'),
('00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'Ana', 'Lopez', 'renter', 'contacted'),
('00000000-0000-0000-0000-000000000001', '53520333-3303-4ae9-a3b4-c8207ae8c744', 'Pedro', 'Garcia', 'buyer', 'qualified');

-- Operaciones (Para métricas)
INSERT INTO operations (id, agency_id, producer_id, status, sale_price, closing_date)
VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'completed', 12000000, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '53520333-3303-4ae9-a3b4-c8207ae8c744', 'completed', 8500000, NOW() - INTERVAL '10 days');

-- Objetivos
DELETE FROM user_objectives;
INSERT INTO user_objectives (agency_id, user_id, period, target_amount, current_amount, start_date, end_date)
VALUES 
('00000000-0000-0000-0000-000000000001', '483ea6a0-09b9-4763-8ad0-dab546418ff8', 'monthly', 15000000, 12000000, '2025-01-01', '2025-12-31'),
('00000000-0000-0000-0000-000000000001', '53520333-3303-4ae9-a3b4-c8207ae8c744', 'monthly', 10000000, 8500000, '2025-01-01', '2025-12-31');

-- 3. VERIFICACIÓN FINAL
SELECT '✅ Esquema reparado y datos cargados exitosamente!' as status;
