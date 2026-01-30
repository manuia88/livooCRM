-- ============================================
-- SCRIPT DE REPARACIÓN COMPLETA DEL BACKOFFICE
-- ============================================
-- Este script crea todas las vistas faltantes y datos de prueba

-- ============================================
-- 1. VISTA DE CONTACTOS CON DETALLES
-- ============================================

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
    -- Get last interaction date
    (
        SELECT MAX(created_at) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS last_interaction,
    -- Count total interactions
    (
        SELECT COUNT(*) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS total_interactions
FROM contacts c
LEFT JOIN user_profiles up ON c.assigned_to = up.id;

-- Grant access
GRANT SELECT ON v_contacts_with_details TO authenticated;

COMMENT ON VIEW v_contacts_with_details IS 'Vista completa de contactos con detalles e interacciones';

-- ============================================
-- 2. VERIFICAR Y RECREAR VISTA DE TAREAS
-- ============================================

-- Esta vista ya debería existir, pero la recreamos por si acaso
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
    -- Contact info
    c.full_name AS contact_name,
    c.phone AS contact_phone,
    c.email AS contact_email,
    -- Property info
    p.title AS property_title,
    p.address AS property_address,
    -- User info
    up_assigned.full_name AS assigned_to_name,
    up_created.full_name AS created_by_name,
    -- Calculate if overdue
    CASE 
        WHEN t.status = 'pendiente' AND t.due_date < NOW() THEN true
        ELSE false
    END AS is_overdue,
    -- Calculate days until due
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

COMMENT ON VIEW v_tasks_with_details IS 'Vista completa de tareas con información relacionada';

-- ============================================
-- 3. DATOS DE PRUEBA PARA CONTACTOS
-- ============================================

-- Insertar contactos de prueba solo si no existen
INSERT INTO contacts (
    first_name, 
    last_name, 
    full_name, 
    email, 
    phone, 
    contact_type, 
    source, 
    status, 
    lead_score,
    current_stage
)
SELECT * FROM (VALUES
    ('Juan', 'Pérez', 'Juan Pérez', 'juan.perez@email.com', '+52 55 1234 5678', 'buyer', 'website', 'qualified', 85, 'negotiation'),
    ('María', 'González', 'María González', 'maria.gonzalez@email.com', '+52 55 2345 6789', 'seller', 'referral', 'contacted', 65, 'qualification'),
    ('Carlos', 'Rodríguez', 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '+52 55 3456 7890', 'buyer', 'facebook', 'qualified', 78, 'presentation'),
    ('Ana', 'Martínez', 'Ana Martínez', 'ana.martinez@email.com', '+52 55 4567 8901', 'investor', 'website', 'negotiating', 92, 'proposal'),
    ('Luis', 'Hernández', 'Luis Hernández', 'luis.hernandez@email.com', '+52 55 5678 9012', 'seller', 'website', 'lead', 45, 'initial_contact'),
    ('Laura', 'López', 'Laura López', 'laura.lopez@email.com', '+52 55 6789 0123', 'buyer', 'instagram', 'qualified', 88, 'negotiation'),
    ('Pedro', 'García', 'Pedro García', 'pedro.garcia@email.com', '+52 55 7890 1234', 'tenant', 'website', 'contacted', 55, 'qualification'),
    ('Sofia', 'Sánchez', 'Sofia Sánchez', 'sofia.sanchez@email.com', '+52 55 8901 2345', 'buyer', 'google', 'qualified', 82, 'presentation')
) AS v(first_name, last_name, full_name, email, phone, contact_type, source, status, lead_score, current_stage)
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = v.email);

-- ============================================
-- 4. DATOS DE PRUEBA PARA TAREAS
-- ============================================

-- Insertar tareas de prueba
DO $$
DECLARE
    v_contact_id UUID;
    v_user_id UUID;
BEGIN
    -- Obtener un contacto aleatorio
    SELECT id INTO v_contact_id FROM contacts LIMIT 1;
    
    -- Obtener el usuario actual (si existe)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- Insertar tareas solo si hay contactos
    IF v_contact_id IS NOT NULL THEN
        INSERT INTO tasks (
            title,
            description,
            task_type,
            priority,
            status,
            due_date,
            contact_id,
            assigned_to,
            created_by
        )
        SELECT * FROM (VALUES
            ('Llamar a cliente', 'Seguimiento sobre propiedad en Polanco', 'call', 'alta', 'pendiente', NOW() + INTERVAL '2 hours', v_contact_id, v_user_id, v_user_id),
            ('Enviar documentos', 'Enviar contratos y documentación legal', 'email', 'media', 'pendiente', NOW() + INTERVAL '1 day', v_contact_id, v_user_id, v_user_id),
            ('Agenda visita', 'Programar visita a propiedad en Roma', 'visit', 'alta', 'pendiente', NOW() + INTERVAL '3 days', v_contact_id, v_user_id, v_user_id),
            ('Seguimiento post-visita', 'Contactar después de la visita', 'follow_up', 'media', 'pendiente', NOW() + INTERVAL '5 days', v_contact_id, v_user_id, v_user_id),
            ('Revisar propuesta', 'Verificar propuesta económica', 'review', 'baja', 'pendiente', NOW() + INTERVAL '1 week', v_contact_id, v_user_id, v_user_id)
        ) AS v(title, description, task_type, priority, status, due_date, contact_id, assigned_to, created_by)
        WHERE NOT EXISTS (
            SELECT 1 FROM tasks WHERE title = v.title AND contact_id = v_contact_id
        );
    END IF;
END $$;

-- ============================================
-- 5. DATOS DE PRUEBA PARA ACTIVITY LOGS
-- ============================================

-- Insertar actividad reciente para el dashboard
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            created_at
        )
        SELECT * FROM (VALUES
            (v_user_id, 'property_created', 'Nueva propiedad agregada al catálogo', NOW() - INTERVAL '1 hour'),
            (v_user_id, 'contact_created', 'Nuevo contacto desde formulario web', NOW() - INTERVAL '2 hours'),
            (v_user_id, 'task_completed', 'Tarea completada: Llamar a cliente', NOW() - INTERVAL '3 hours'),
            (v_user_id, 'message_sent', 'Mensaje enviado a Juan Pérez', NOW() - INTERVAL '4 hours'),
            (v_user_id, 'property_updated', 'Actualización de precio en propiedad', NOW() - INTERVAL '5 hours')
        ) AS v(user_id, action, details, created_at)
        WHERE NOT EXISTS (
            SELECT 1 FROM activity_logs 
            WHERE user_id = v.user_id 
            AND action = v.action 
            AND details = v.details
        );
    END IF;
END $$;

-- ============================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ============================================

-- Asegurar que las tablas tengan RLS habilitado pero permisivo para desarrollo
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Política permisiva para contactos (todos los usuarios autenticados pueden ver todos los contactos)
DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
CREATE POLICY "Allow authenticated users to view all contacts"
ON contacts FOR SELECT
TO authenticated
USING (true);

-- Política permisiva para tareas
DROP POLICY IF EXISTS "Allow authenticated users to view all tasks" ON tasks;
CREATE POLICY "Allow authenticated users to view all tasks"
ON tasks FOR SELECT
TO authenticated
USING (true);

-- Política permisiva para activity logs
DROP POLICY IF EXISTS "Allow authenticated users to view activity logs" ON activity_logs;
CREATE POLICY "Allow authenticated users to view activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 7. RECREAR MÉTRICAS DE TAREAS
-- ============================================

-- Crear la tabla de métricas si no existe
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

-- Habilitar RLS
ALTER TABLE task_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Política para ver métricas
DROP POLICY IF EXISTS "Users can view their own metrics" ON task_performance_metrics;
CREATE POLICY "Users can view their own metrics"
ON task_performance_metrics FOR SELECT
TO authenticated
USING (true);

-- Función para calcular métricas del mes actual
CREATE OR REPLACE FUNCTION get_current_month_metrics(p_user_id UUID)
RETURNS TABLE (
    tasks_completed INTEGER,
    tasks_postponed INTEGER,
    completion_rate NUMERIC,
    ranking_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN status = 'completada' THEN 1 END)::INTEGER,
        COUNT(CASE WHEN status = 'pospuesta' THEN 1 END)::INTEGER,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'completada' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END,
        1::INTEGER -- Ranking placeholder
    FROM tasks
    WHERE assigned_to = p_user_id
        AND created_at >= DATE_TRUNC('month', NOW())
        AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution
GRANT EXECUTE ON FUNCTION get_current_month_metrics(UUID) TO authenticated;

-- ============================================
-- 8. ACTUALIZAR HEALTH SCORES
-- ============================================

-- Actualizar health score de propiedades existentes
UPDATE properties 
SET health_score = 
    CASE 
        WHEN status = 'active' THEN 85
        WHEN status = 'draft' THEN 45
        WHEN status = 'reserved' THEN 70
        ELSE 50
    END
WHERE health_score = 0 OR health_score IS NULL;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Script de reparación completado exitosamente!' AS status;
