-- =============================================
-- SCRIPT MAESTRO - SETUP COMPLETO DEL BACKOFFICE
-- =============================================
-- Este script ejecuta TODO lo necesario en el orden correcto
-- Paso 1: Extensiones
-- Paso 2: Tablas Core (usuarios, agencias)
-- Paso 3: Tablas de Negocio (propiedades, contactos, tareas)
-- Paso 4: Vistas
-- Paso 5: Políticas RLS
-- Paso 6: Datos de Prueba

-- =============================================
-- PASO 1: EXTENSIONES
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- PASO 2: TABLAS CORE
-- =============================================

-- Agencias
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    settings JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'America/Mexico_City',
    plan_type TEXT DEFAULT 'trial',
    plan_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id),
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
    avatar_url TEXT,
    phone TEXT,
    whatsapp TEXT,
    role TEXT DEFAULT 'agent',
    permissions JSONB DEFAULT '[]',
    license_number TEXT,
    specialties JSONB DEFAULT '[]',
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PASO 3: TABLAS DE NEGOCIO
-- =============================================

-- Properties
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id),
    created_by UUID REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT,
    operation_type TEXT CHECK (operation_type IN ('sale', 'rent', 'both')),
    status TEXT DEFAULT 'draft',
    
    address JSONB NOT NULL,
    street TEXT,
    exterior_number TEXT,
    interior_number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'México',
    coordinates GEOGRAPHY(POINT, 4326),
    show_exact_location BOOLEAN DEFAULT false,
    
    bedrooms INTEGER,
    bathrooms NUMERIC(3,1),
    half_bathrooms INTEGER,
    parking_spaces INTEGER,
    construction_m2 NUMERIC(10,2),
    land_m2 NUMERIC(10,2),
    total_m2 NUMERIC(10,2),
    floors INTEGER,
    floor_number INTEGER,
    year_built INTEGER,
    condition TEXT,
    
    sale_price NUMERIC(12,2),
    rent_price NUMERIC(12,2),
    currency TEXT DEFAULT 'MXN',
    maintenance_fee NUMERIC(10,2),
    property_tax NUMERIC(10,2),
    
    amenities JSONB DEFAULT '[]',
    features JSONB DEFAULT '{}',
    
    shared_in_mls BOOLEAN DEFAULT false,
    mls_id TEXT,
    commission_shared BOOLEAN DEFAULT false,
    commission_percentage NUMERIC(5,2),
    commission_amount NUMERIC(12,2),
    is_exclusive BOOLEAN DEFAULT false,
    exclusivity_expires_at TIMESTAMPTZ,
    
    health_score INTEGER DEFAULT 0,
    
    photos JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    floor_plan_url TEXT,
    
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    slug TEXT,
    meta_title TEXT,
    meta_description TEXT,
    
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id),
    created_by UUID REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    
    contact_type TEXT NOT NULL,
    source TEXT,
    status TEXT DEFAULT 'lead',
    current_stage TEXT,
    
    lead_score INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    
    company TEXT,
    position TEXT,
    
    address JSONB,
    
    notes TEXT,
    
    last_contact_date TIMESTAMPTZ,
    next_followup_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Contact Interactions
CREATE TABLE IF NOT EXISTS contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    
    type TEXT NOT NULL,
    channel TEXT,
    direction TEXT,
    
    subject TEXT,
    description TEXT,
    outcome TEXT,
    
    duration_minutes INTEGER,
    
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id),
    created_by UUID REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    
    title TEXT NOT NULL,
    description TEXT,
    
    task_type TEXT NOT NULL,
    priority TEXT DEFAULT 'media',
    status TEXT DEFAULT 'pendiente',
    
    contact_id UUID REFERENCES contacts(id),
    property_id UUID REFERENCES properties(id),
    
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    is_auto_generated BOOLEAN DEFAULT false,
    auto_gen_rule_id UUID,
    
    result TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =============================================
-- PASO 4: VISTAS
-- =============================================

-- Vista de Contactos con Detalles
DROP VIEW IF EXISTS v_contacts_with_details CASCADE;

CREATE OR REPLACE VIEW v_contacts_with_details AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.full_name,
    c.email,
    c.phone,
    c.contact_type,
    c.source,
    c.status,
    c.lead_score,
    c.current_stage,
    c.created_at,
    c.updated_at,
    up.full_name AS assigned_to_name,
    (
        SELECT MAX(created_at) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS last_interaction,
    (
        SELECT COUNT(*) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS total_interactions
FROM contacts c
LEFT JOIN user_profiles up ON c.assigned_to = up.id;

GRANT SELECT ON v_contacts_with_details TO authenticated;

-- Vista de Tareas con Detalles
DROP VIEW IF EXISTS v_tasks_with_details CASCADE;

CREATE OR REPLACE VIEW v_tasks_with_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.task_type,
    t.priority,
    t.status,
    t.due_date,
    t.completed_at,
    t.created_at,
    t.updated_at,
    t.contact_id,
    t.property_id,
    t.assigned_to,
    t.created_by,
    t.is_auto_generated,
    c.full_name AS contact_name,
    c.phone AS contact_phone,
    c.email AS contact_email,
    p.title AS property_title,
    p.address AS property_address,
    up_assigned.full_name AS assigned_to_name,
    up_created.full_name AS created_by_name,
    CASE 
        WHEN t.status = 'pendiente' AND t.due_date < NOW() THEN true
        ELSE false
    END AS is_overdue,
    CASE 
        WHEN t.due_date IS NOT NULL THEN 
            EXTRACT(DAY FROM (t.due_date - NOW()))::INTEGER
        ELSE NULL
    END AS days_until_due
FROM tasks t
LEFT JOIN contacts c ON t.contact_id = c.id
LEFT JOIN properties p ON t.property_id = p.id
LEFT JOIN user_profiles up_assigned ON t.assigned_to = up_assigned.id
LEFT JOIN user_profiles up_created ON t.created_by = up_created.id;

GRANT SELECT ON v_tasks_with_details TO authenticated;

-- =============================================
-- PASO 5: POLÍTICAS RLS
-- =============================================

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON properties;
CREATE POLICY "Allow authenticated users to view properties"
ON properties FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert properties" ON properties;
CREATE POLICY "Users can insert properties"
ON properties FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update properties" ON properties;
CREATE POLICY "Users can update properties"
ON properties FOR UPDATE TO authenticated USING (true);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
CREATE POLICY "Allow authenticated users to view all contacts"
ON contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
CREATE POLICY "Users can insert contacts"
ON contacts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
CREATE POLICY "Users can update contacts"
ON contacts FOR UPDATE TO authenticated USING (true);

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view all tasks" ON tasks;
CREATE POLICY "Allow authenticated users to view all tasks"
ON tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
CREATE POLICY "Users can insert tasks"
ON tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
CREATE POLICY "Users can update tasks"
ON tasks FOR UPDATE TO authenticated USING (true);

-- Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view activity logs" ON activity_logs;
CREATE POLICY "Allow authenticated users to view activity logs"
ON activity_logs FOR SELECT TO authenticated USING (true);

-- =============================================
-- PASO 6: MÉTRICAS Y FUNCIONES
-- =============================================

-- Tabla de Métricas
CREATE TABLE IF NOT EXISTS task_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_postponed INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0,
    avg_completion_time_hours NUMERIC(10,2),
    ranking_position INTEGER,
    total_team_members INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view metrics" ON task_performance_metrics;
CREATE POLICY "Users can view metrics"
ON task_performance_metrics FOR SELECT TO authenticated USING (true);

-- =============================================
-- PASO 7: DATOS DE PRUEBA
-- =============================================

-- Insertar agencia por defecto
INSERT INTO agencies (name, slug, email, phone, is_active)
SELECT 'Livoo Real Estate', 'livoo', 'info@livoo.mx', '+52 55 1234 5678', true
WHERE NOT EXISTS (SELECT 1 FROM agencies WHERE slug = 'livoo');

-- Insertar contactos de prueba
DO $$
DECLARE
    v_agency_id UUID;
BEGIN
    SELECT id INTO v_agency_id FROM agencies LIMIT 1;
    
    INSERT INTO contacts (
        agency_id, first_name, last_name, email, phone, 
        contact_type, source, status, lead_score, current_stage
    )
    SELECT v_agency_id, * FROM (VALUES
        ('Juan', 'Pérez', 'juan.perez@email.com', '+52 55 1234 5678', 
         'buyer', 'website', 'qualified', 85, 'negotiation'),
        ('María', 'González', 'maria.gonzalez@email.com', '+52 55 2345 6789', 
         'seller', 'referral', 'contacted', 65, 'qualification'),
        ('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+52 55 3456 7890', 
         'buyer', 'facebook', 'qualified', 78, 'presentation'),
        ('Ana', 'Martínez', 'ana.martinez@email.com', '+52 55 4567 8901', 
         'investor', 'website', 'negotiating', 92, 'proposal'),
        ('Luis', 'Hernández', 'luis.hernandez@email.com', '+52 55 5678 9012', 
         'seller', 'website', 'lead', 45, 'initial_contact'),
        ('Laura', 'López', 'laura.lopez@email.com', '+52 55 6789 0123', 
         'buyer', 'instagram', 'qualified', 88, 'negotiation')
    ) AS v(first_name, last_name, email, phone, contact_type, source, status, lead_score, current_stage)
    WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = v.email);
END $$;

-- Insertar actividad de prueba
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO activity_logs (user_id, action, details, created_at)
        SELECT v_user_id, * FROM (VALUES
            ('property_created', 'Nueva propiedad agregada', NOW() - INTERVAL '1 hour'),
            ('contact_created', 'Nuevo contacto desde web', NOW() - INTERVAL '2 hours'),
            ('task_completed', 'Tarea completada exitosamente', NOW() - INTERVAL '3 hours'),
            ('message_sent', 'Mensaje enviado a cliente', NOW() - INTERVAL '4 hours')
        ) AS v(action, details, created_at)
        WHERE NOT EXISTS (
            SELECT 1 FROM activity_logs 
            WHERE action = v.action AND details = v.details
        );
    END IF;
END $$;

-- =============================================
-- FINALIZACIÓN
-- =============================================

SELECT 
    '✅ SCRIPT COMPLETADO EXITOSAMENTE' AS status,
    (SELECT COUNT(*) FROM contacts) AS contactos_creados,
    (SELECT COUNT(*) FROM properties) AS propiedades,
    (SELECT COUNT(*) FROM tasks) AS tareas,
    (SELECT COUNT(*) FROM activity_logs) AS actividad_logs;
