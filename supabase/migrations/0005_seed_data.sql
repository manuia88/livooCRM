-- =============================================
-- NEXUS OS - Seed Data for Testing
-- Migration: 0005_seed_data
-- Description: Sample data for development/testing
-- =============================================

-- =============================================
-- IMPORTANT: Only run this in development!
-- =============================================

-- Create demo agency
INSERT INTO agencies (id, name, slug, email, phone, plan_type, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Real Estate Agency',
    'demo-agency',
    'contact@demoagency.com',
    '+52 55 1234 5678',
    'pro',
    true
) ON CONFLICT (id) DO NOTHING;

-- Note: Users must be created via Supabase Auth first
-- This assumes you've created users and have their UUIDs
-- For testing, you can insert user_profiles manually after creating auth users

-- Example user profile insert (replace UUID with actual auth.users UUID)
-- INSERT INTO user_profiles (id, agency_id, first_name, last_name, role, is_active)
-- VALUES (
--     'YOUR-AUTH-USER-UUID-HERE',
--     '00000000-0000-0000-0000-000000000001',
--     'Admin',
--     'Demo',
--     'admin',
--     true
-- );

-- =============================================
-- SAMPLE PROPERTIES
-- =============================================

INSERT INTO properties (
    id,
    agency_id,
    title,
    description,
    property_type,
    operation_type,
    status,
    street,
    neighborhood,
    city,
    state,
    country,
    postal_code,
    coordinates,
    show_exact_location,
    bedrooms,
    bathrooms,
    parking_spaces,
    construction_m2,
    land_m2,
    sale_price,
    currency,
    amenities,
    photos
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Casa Moderna en Polanco',
    'Hermosa casa moderna de 3 niveles en el corazón de Polanco. Acabados de lujo, cocina italiana, jardín privado y roof garden con vista panorámica. A pasos de restaurantes, boutiques y parques.',
    'house',
    'sale',
    'active',
    'Anatole France',
    'Polanco V Sección',
    'Ciudad de México',
    'CDMX',
    'México',
    '11560',
    ST_SetSRID(ST_MakePoint(-99.1949, 19.4326), 4326)::geography,
    true,
    4,
    3.5,
    2,
    350.00,
    400.00,
    12500000.00,
    'MXN',
    '["pool", "gym", "garden", "roof_terrace", "security_24_7", "smart_home"]'::jsonb,
    '[{"url": "https://example.com/photo1.jpg"}, {"url": "https://example.com/photo2.jpg"}]'::jsonb
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Departamento de Lujo en Santa Fe',
    'Espectacular departamento en torre de lujo. Vista panorámica, 2 estacionamientos, amenidades completas. Ubicado en Samara Santa Fe.',
    'apartment',
    'sale',
    'active',
    'Javier Barros Sierra',
    'Santa Fe',
    'Ciudad de México',
    'CDMX',
    'México',
    '01219',
    ST_SetSRID(ST_MakePoint(-99.2591, 19.3586), 4326)::geography,
    true,
    3,
    2.5,
    2,
    180.00,
    NULL,
    8950000.00,
    'MXN',
    '["gym", "pool", "business_center", "kids_area", "cinema", "party_room"]'::jsonb,
    '[{"url": "https://example.com/photo3.jpg"}]'::jsonb
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Oficina en Reforma',
    'Oficina corporativa en Torre Premier. Piso completo, 500 m2, lista para mudarse. Ideal para corporativos.',
    'office',
    'rent',
    'active',
    'Paseo de la Reforma',
    'Juárez',
    'Ciudad de México',
    'CDMX',
    'México',
    '06600',
    ST_SetSRID(ST_MakePoint(-99.1677, 19.4270), 4326)::geography,
    false,
    NULL,
    4.0,
    10,
    500.00,
    NULL,
    250000.00,
    'MXN',
    '["elevator", "security_24_7", "parking", "reception", "server_room"]'::jsonb,
    '[]'::jsonb
),
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Terreno en Playa del Carmen',
    'Terreno residencial a 5 minutos de la playa. Uso de suelo mixto, servicios completos.',
    'land',
    'sale',
    'active',
    'Carretera Federal',
    'Ejido Sur',
    'Playa del Carmen',
    'Quintana Roo',
    'México',
    '77710',
    ST_SetSRID(ST_MakePoint(-87.0739, 20.6296), 4326)::geography,
    true,
    NULL,
    NULL,
    NULL,
    NULL,
    1200.00,
    4500000.00,
    'MXN',
    '["water", "electricity", "drainage"]'::jsonb,
    '[{"url": "https://example.com/photo4.jpg"}]'::jsonb
),
(
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Penthouse en Condesa',
    'Increíble penthouse en el corazón de la Condesa. 2 niveles, terraza privada de 100m2. Edificio boutique.',
    'apartment',
    'both',
    'active',
    'Avenida Amsterdam',
    'Hipódromo Condesa',
    'Ciudad de México',
    'CDMX',
    'México',
    '06100',
    ST_SetSRID(ST_MakePoint(-99.1712, 19.4118), 4326)::geography,
    true,
    2,
    2.0,
    1,
    150.00,
    NULL,
    7800000.00,
    'MXN',
    '["terrace", "bbq_area", "bike_parking", "pet_friendly"]'::jsonb,
    '[{"url": "https://example.com/photo5.jpg"}]'::jsonb
);

-- =============================================
-- SAMPLE CONTACTS
-- =============================================

INSERT INTO contacts (
    id,
    agency_id,
    first_name,
    last_name,
    email,
    phone,
    whatsapp,
    type,
    status,
    lead_score,
    source,
    budget_min,
    budget_max,
    search_criteria,
    tags
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'María',
    'González',
    'maria.gonzalez@example.com',
    '+52 55 1111 2222',
    '+52 55 1111 2222',
    'buyer',
    'qualified',
    75,
    'website',
    5000000.00,
    10000000.00,
    '{"property_types": ["apartment", "house"], "zones": ["Polanco", "Santa Fe"], "bedrooms_min": 2}'::jsonb,
    '["hot_lead", "first_time_buyer"]'::jsonb
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Carlos',
    'Martínez',
    'carlos.martinez@example.com',
    '+52 55 3333 4444',
    '+52 55 3333 4444',
    'investor',
    'negotiating',
    85,
    'referral',
    10000000.00,
    20000000.00,
    '{"property_types": ["apartment", "office"], "zones": ["Reforma", "Santa Fe"], "roi_min": 8}'::jsonb,
    '["investor", "cash_buyer"]'::jsonb
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Ana',
    'Rodríguez',
    'ana.rodriguez@example.com',
    '+52 55 5555 6666',
    '+52 55 5555 6666',
    'renter',
    'visiting',
    60,
    'instagram',
    20000.00,
    40000.00,
    '{"property_types": ["apartment"], "zones": ["Condesa", "Roma"], "bedrooms_min": 1, "pet_friendly": true}'::jsonb,
    '["young_professional"]'::jsonb
);

-- =============================================
-- LINK CONTACTS TO PROPERTIES
-- =============================================

INSERT INTO contact_properties (contact_id, property_id, interest_level, notes)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'high', 'Le encantó la casa, quiere agendar segunda visita'),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'medium', 'Considera Santa Fe muy lejos'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'high', 'Interesado en oficina para su empresa'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'high', 'Su opción favorita, tiene perro');

-- =============================================
-- SAMPLE CONTACT TAGS
-- =============================================

INSERT INTO contact_tags (agency_id, name, color)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'hot_lead', '#FF5733'),
    ('00000000-0000-0000-0000-000000000001', 'investor', '#3498DB'),
    ('00000000-0000-0000-0000-000000000001', 'first_time_buyer', '#2ECC71'),
    ('00000000-0000-0000-0000-000000000001', 'cash_buyer', '#F1C40F'),
    ('00000000-0000-0000-0000-000000000001', 'young_professional', '#9B59B6');

-- =============================================
-- SAMPLE CONTACT SOURCES
-- =============================================

INSERT INTO contact_sources (agency_id, name, type, cost_per_lead)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Website Orgánico', 'organic', 0),
    ('00000000-0000-0000-0000-000000000001', 'Facebook Ads', 'paid', 150.00),
    ('00000000-0000-0000-0000-000000000001', 'Instagram Ads', 'paid', 120.00),
    ('00000000-0000-0000-0000-000000000001', 'Referidos', 'referral', 0),
    ('00000000-0000-0000-0000-000000000001', 'Inmuebles24', 'portal', 80.00);

-- =============================================
-- SAMPLE TASK TEMPLATES
-- =============================================

INSERT INTO task_templates (
    agency_id,
    name,
    description,
    task_type,
    default_title,
    default_description,
    default_priority,
    default_due_days
)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Subir Fotos de Propiedad',
        'Template para recordar subir fotos de calidad',
        'property',
        'Subir fotos profesionales',
        'Subir al menos 15 fotos de alta calidad de la propiedad',
        'high',
        2
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Primera Llamada a Lead',
        'Template para contacto inicial',
        'contact',
        'Realizar primer contacto',
        'Llamar al lead para calificar necesidades y agendar cita',
        'high',
        1
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Follow-up Post Visita',
        'Template para seguimiento después de visita',
        'contact',
        'Follow-up post visita',
        'Contactar cliente para conocer su opinión sobre la propiedad visitada',
        'medium',
        1
    );

-- =============================================
-- SAMPLE EMAIL TEMPLATES
-- =============================================

INSERT INTO email_templates (
    agency_id,
    name,
    subject,
    body_html,
    body_text,
    category
)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Bienvenida Nuevo Lead',
        'Gracias por tu interés en {{property_title}}',
        '<h1>¡Hola {{contact_name}}!</h1><p>Gracias por tu interés en <strong>{{property_title}}</strong>. En breve uno de nuestros asesores se pondrá en contacto contigo.</p>',
        'Hola {{contact_name}}! Gracias por tu interés en {{property_title}}. En breve uno de nuestros asesores se pondrá en contacto contigo.',
        'lead_nurturing'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Confirmar Visita',
        'Confirmación de visita - {{property_title}}',
        '<h1>Visita Confirmada</h1><p>Tu visita a <strong>{{property_title}}</strong> está confirmada para el {{visit_date}} a las {{visit_time}}.</p><p>Dirección: {{property_address}}</p>',
        'Visita confirmada para {{property_title}} el {{visit_date}} a las {{visit_time}}. Dirección: {{property_address}}',
        'appointments'
    );

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE agencies IS 'Includes 1 demo agency for testing';
COMMENT ON TABLE properties IS 'Includes 5 sample properties across CDMX and Playa del Carmen';
COMMENT ON TABLE contacts IS 'Includes 3 sample contacts with different buyer personas';

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Run this to verify seed data was inserted:
/*
SELECT 'Agencies' as table_name, COUNT(*) as records FROM agencies
UNION ALL
SELECT 'Properties', COUNT(*) FROM properties
UNION ALL
SELECT 'Contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'Contact Properties', COUNT(*) FROM contact_properties
UNION ALL
SELECT 'Contact Tags', COUNT(*) FROM contact_tags
UNION ALL
SELECT 'Contact Sources', COUNT(*) FROM contact_sources
UNION ALL
SELECT 'Task Templates', COUNT(*) FROM task_templates
UNION ALL
SELECT 'Email Templates', COUNT(*) FROM email_templates;
*/
