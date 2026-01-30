-- ============================================================================
-- NEXUS OS - FUNCIONES AUXILIARES PARA AUTO-GENERACIÓN
-- Migration: 0012_tasks_auto_generation_helpers.sql
-- ============================================================================

-- ============================================================================
-- FUNCIÓN: Encontrar contactos sin interacción
-- ============================================================================
CREATE OR REPLACE FUNCTION find_contacts_without_interaction(days_threshold INTEGER)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  assigned_to UUID,
  agency_id UUID,
  last_interaction_at TIMESTAMPTZ,
  days_since_last_interaction INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.assigned_to,
    c.agency_id,
    c.last_contact_date as last_interaction_at,
    EXTRACT(DAY FROM NOW() - c.last_contact_date)::INTEGER as days_since_last_interaction
  FROM contacts c
  WHERE 
    c.last_contact_date IS NOT NULL
    AND c.last_contact_date < NOW() - (days_threshold || ' days')::INTERVAL
    AND c.status = 'qualified'
    AND c.deleted_at IS NULL
    -- No crear tarea si ya existe una pendiente
    AND NOT EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.contact_id = c.id
        AND t.task_type = 'follow_up'
        AND t.status = 'pendiente'
        AND t.deleted_at IS NULL
    )
  ORDER BY c.last_contact_date ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Calcular métricas de tareas para un usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_task_metrics_for_user(
  p_user_id UUID,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_agency_id UUID;
  v_total_assigned INTEGER;
  v_completed INTEGER;
  v_completed_on_time INTEGER;
  v_completed_late INTEGER;
  v_overdue INTEGER;
  v_avg_completion_time INTERVAL;
BEGIN
  -- Obtener agency_id
  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = p_user_id;

  -- Contar tareas
  SELECT 
    COUNT(*) FILTER (WHERE status != 'cancelada'),
    COUNT(*) FILTER (WHERE status = 'completada'),
    COUNT(*) FILTER (WHERE status = 'completada' AND completed_at <= due_date),
    COUNT(*) FILTER (WHERE status = 'completada' AND completed_at > due_date),
    COUNT(*) FILTER (WHERE status = 'vencida')
  INTO
    v_total_assigned,
    v_completed,
    v_completed_on_time,
    v_completed_late,
    v_overdue
  FROM tasks
  WHERE assigned_to = p_user_id
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND deleted_at IS NULL;

  -- Calcular tiempo promedio
  SELECT AVG(completed_at - created_at)
  INTO v_avg_completion_time
  FROM tasks
  WHERE assigned_to = p_user_id
    AND status = 'completada'
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND deleted_at IS NULL;

  -- Construir JSON
  v_result := json_build_object(
    'user_id', p_user_id,
    'agency_id', v_agency_id,
    'period_month', p_month,
    'period_year', p_year,
    'total_tasks_assigned', v_total_assigned,
    'tasks_completed', v_completed,
    'tasks_completed_on_time', v_completed_on_time,
    'tasks_completed_late', v_completed_late,
    'tasks_overdue', v_overdue,
    'avg_completion_time_hours', EXTRACT(EPOCH FROM v_avg_completion_time) / 3600,
    'completion_rate', CASE 
      WHEN v_total_assigned > 0 
      THEN ROUND((v_completed::NUMERIC / v_total_assigned) * 100, 2)
      ELSE 0 
    END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Obtener ranking de equipo
-- ============================================================================
CREATE OR REPLACE FUNCTION get_team_ranking(
  p_agency_id UUID,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
)
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  tasks_completed INTEGER,
  completion_rate NUMERIC,
  ranking_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      t.assigned_to,
      up.first_name || ' ' || COALESCE(up.last_name, '') as name,
      COUNT(*) FILTER (WHERE t.status = 'completada') as completed,
      COUNT(*) FILTER (WHERE t.status != 'cancelada') as total,
      CASE 
        WHEN COUNT(*) FILTER (WHERE t.status != 'cancelada') > 0
        THEN ROUND((COUNT(*) FILTER (WHERE t.status = 'completada')::NUMERIC / 
             COUNT(*) FILTER (WHERE t.status != 'cancelada')) * 100, 2)
        ELSE 0
      END as rate
    FROM tasks t
    JOIN user_profiles up ON t.assigned_to = up.id
    WHERE 
      t.agency_id = p_agency_id
      AND EXTRACT(MONTH FROM t.created_at) = p_month
      AND EXTRACT(YEAR FROM t.created_at) = p_year
      AND t.deleted_at IS NULL
    GROUP BY t.assigned_to, up.first_name, up.last_name
  )
  SELECT 
    assigned_to,
    name,
    completed::INTEGER,
    rate,
    ROW_NUMBER() OVER (ORDER BY completed DESC)::INTEGER as position
  FROM user_stats
  ORDER BY completed DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABLA: Registrar log de auto-generación
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_auto_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  execution_type TEXT NOT NULL, -- 'auto_generation', 'check_overdue', 'calculate_metrics'
  tasks_affected INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_auto_gen_log_date ON task_auto_generation_log(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_gen_log_type ON task_auto_generation_log(execution_type);

-- ============================================================================
-- FUNCIÓN: Limpiar logs antiguos (mantener últimos 30 días)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_auto_generation_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM task_auto_generation_log
  WHERE executed_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT EXECUTE ON FUNCTION find_contacts_without_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_task_metrics_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_ranking TO authenticated;
GRANT SELECT ON task_auto_generation_log TO authenticated;

-- RLS para logs
ALTER TABLE task_auto_generation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view logs" ON task_auto_generation_log;
CREATE POLICY "Users can view logs"
ON task_auto_generation_log FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
SELECT '✅ Funciones de auto-generación creadas exitosamente' AS resultado;
