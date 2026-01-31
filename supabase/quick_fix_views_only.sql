-- ============================================
-- VERIFICACIÓN Y CREACIÓN DE VISTAS SOLAMENTE
-- ============================================
-- Este script solo crea las vistas necesarias
-- Asume que las tablas base ya existen

-- ============================================
-- 1. VISTA DE CONTACTOS CON DETALLES
-- ============================================

-- Primero verificar si la tabla contacts existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
        -- Crear la vista
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
        
        RAISE NOTICE 'Vista v_contacts_with_details creada exitosamente';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: Tabla contacts no existe. Saltando creación de vista.';
    END IF;
END $$;

-- ============================================
-- 2. VISTA DE TAREAS (Verificar si existe)
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
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
        
        RAISE NOTICE 'Vista v_tasks_with_details creada exitosamente';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: Tabla tasks no existe. Saltando creación de vista.';
    END IF;
END $$;

-- ============================================
-- 3. POLÍTICAS RLS (solo si las tablas existen)
-- ============================================

DO $$ 
BEGIN
    -- Contactos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
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
        
        RAISE NOTICE 'Políticas RLS para contacts configuradas';
    END IF;

    -- Tareas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
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
        
        RAISE NOTICE 'Políticas RLS para tasks configuradas';
    END IF;

    -- Activity logs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to view activity logs" ON activity_logs;
        CREATE POLICY "Allow authenticated users to view activity logs"
        ON activity_logs FOR SELECT TO authenticated USING (true);
        
        RAISE NOTICE 'Políticas RLS para activity_logs configuradas';
    END IF;
END $$;

-- ============================================
-- 4. TABLA DE MÉTRICAS
-- ============================================

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

DROP POLICY IF EXISTS "Users can view their own metrics" ON task_performance_metrics;
CREATE POLICY "Users can view their own metrics"
ON task_performance_metrics FOR SELECT TO authenticated USING (true);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

DO $$
DECLARE
    v_contacts_exists BOOLEAN;
    v_tasks_exists BOOLEAN;
    v_view_contacts_exists BOOLEAN;
    v_view_tasks_exists BOOLEAN;
BEGIN
    -- Verificar tablas
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') INTO v_contacts_exists;
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') INTO v_tasks_exists;
    
    -- Verificar vistas
    SELECT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'v_contacts_with_details') INTO v_view_contacts_exists;
    SELECT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'v_tasks_with_details') INTO v_view_tasks_exists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESULTADOS DE LA VERIFICACIÓN:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabla contacts existe: %', v_contacts_exists;
    RAISE NOTICE 'Tabla tasks existe: %', v_tasks_exists;
    RAISE NOTICE 'Vista v_contacts_with_details existe: %', v_view_contacts_exists;
    RAISE NOTICE 'Vista v_tasks_with_details existe: %', v_view_tasks_exists;
    RAISE NOTICE '========================================';
    
    IF v_view_contacts_exists AND v_view_tasks_exists THEN
        RAISE NOTICE '✅ TODO CORRECTO - Las vistas fueron creadas';
    ELSE
        RAISE NOTICE '⚠️  Faltan algunas tablas base. Ejecuta las migraciones primero.';
    END IF;
END $$;

SELECT '✅ Script ejecutado. Revisa los mensajes arriba para ver el estado.' AS resultado;
