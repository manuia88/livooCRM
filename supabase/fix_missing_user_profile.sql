-- =============================================
-- Fix Missing User Profile
-- Inserta el perfil para el usuario autenticado
-- =============================================

-- Primero, asegúrate que existe la agencia demo
INSERT INTO agencies (
    id,
    name,
    slug,
    email,
    phone,
    plan_type,
    is_active
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Real Estate Agency',
    'demo-agency',
    'contact@demoagency.com',
    '+52 55 1234 5678',
    'pro',
    true
) ON CONFLICT (id) DO NOTHING;

-- Inserta el perfil del usuario autenticado
INSERT INTO user_profiles (
    id,
    agency_id,
    first_name,
    last_name,
    role,
    is_active,
    avatar_url,
    phone,
    created_at,
    updated_at
)
VALUES (
    '17ae5051-6ef9-499c-9116-f566ba0a7ad0',
    '00000000-0000-0000-0000-000000000001',
    'Usuario',
    'Admin',
    'admin',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT 
    up.id,
    up.first_name,
    up.last_name,
    up.full_name,
    up.role,
    up.agency_id,
    up.is_active,
    a.name as agency_name
FROM user_profiles up
LEFT JOIN agencies a ON up.agency_id = a.id
WHERE up.id = '17ae5051-6ef9-499c-9116-f566ba0a7ad0';
