-- ============================================================================
-- NEXUS OS - MÓDULO DE TAREAS
-- Migration: 20260130_tasks_module.sql
-- ============================================================================

-- ============================================================================
-- TABLA PRINCIPAL: tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  assigned_to UUID REFERENCES user_profiles(id) NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  
  -- Tipo de tarea
  task_type TEXT NOT NULL CHECK (task_type IN (
    'cliente_seguimiento',          -- Cliente sin interacción
    'visita_confirmar',             -- Visita pendiente de confirmar
    'propiedad_mejorar_fotos',      -- Mejorar calidad de fotos
    'propiedad_ajustar_precio',     -- Ajustar precio según valuación
    'propiedad_completar_docs',     -- Completar documentación
    'propiedad_health_score',       -- Mejorar health score
    'consulta_responder',           -- Consulta sin responder
    'oferta_revisar',               -- Oferta recibida pendiente
    'contrato_enviar',              -- Enviar contrato
    'general'                       -- Tarea manual general
  )),
  
  -- Relaciones (nullable porque puede ser tarea general)
  related_contact_id UUID REFERENCES contacts(id),
  related_property_id UUID REFERENCES properties(id),
  
  -- Contenido de la tarea
  title TEXT NOT NULL,
  description TEXT,
  
  -- Prioridad
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  
  -- Estado
  status TEXT DEFAULT 'pendiente' CHECK (status IN (
    'pendiente',
    'en_proceso',
    'completada',
    'pospuesta',
    'vencida',
    'cancelada'
  )),
  
  -- Auto-generación
  auto_generated BOOLEAN DEFAULT false,
  generation_rule TEXT,
  
  -- Fechas
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  postponed_until TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL AND status = 'pendiente';
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority) WHERE deleted_at IS NULL AND status = 'pendiente';
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date) WHERE deleted_at IS NULL AND status = 'pendiente';
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(related_contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_property ON tasks(related_property_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_auto ON tasks(auto_generated) WHERE auto_generated = true;

-- RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios ven solo tareas de su agencia
DROP POLICY IF EXISTS "Users see tasks from their agency" ON tasks;
CREATE POLICY "Users see tasks from their agency"
ON tasks FOR SELECT
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Policy: Los usuarios pueden crear tareas en su agencia
DROP POLICY IF EXISTS "Users create tasks for their agency" ON tasks;
CREATE POLICY "Users create tasks for their agency"
ON tasks FOR INSERT
WITH CHECK (
  agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Policy: Los usuarios pueden actualizar sus propias tareas o las de su equipo
DROP POLICY IF EXISTS "Users update tasks from their agency" ON tasks;
CREATE POLICY "Users update tasks from their agency"
ON tasks FOR UPDATE
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- ============================================================================
-- TABLA: task_comments (comentarios en tareas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  
  comment TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see comments from tasks they can access" ON task_comments;
CREATE POLICY "Users see comments from tasks they can access"
ON task_comments FOR SELECT
USING (
  task_id IN (
    SELECT id FROM tasks WHERE agency_id IN (
      SELECT agency_id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- ============================================================================
-- TABLA: task_templates (plantillas para tareas recurrentes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  priority TEXT DEFAULT 'media',
  
  -- Template del título y descripción (con variables)
  title_template TEXT NOT NULL,
  description_template TEXT,
  
  -- Configuración de auto-generación
  auto_assign_to_producer BOOLEAN DEFAULT false,
  auto_assign_to_owner BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_templates_agency ON task_templates(agency_id);

-- ============================================================================
-- TABLA: task_automation_log (logs de auto-generación)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  
  rule_type TEXT NOT NULL,
  tasks_generated INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_log_agency ON task_automation_log(agency_id);
CREATE INDEX IF NOT EXISTS idx_automation_log_created ON task_automation_log(created_at DESC);

-- ============================================================================
-- TABLA: task_performance_metrics (métricas de desempeño)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  agency_id UUID REFERENCES agencies(id),
  
  -- Período
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  
  -- Métricas
  total_tasks_assigned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_completed_on_time INTEGER DEFAULT 0,
  tasks_completed_late INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,
  
  -- Tiempos promedio (en minutos)
  avg_completion_time_minutes INTEGER,
  
  -- Ranking
  ranking_position INTEGER,
  total_agents INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_task_metrics_user ON task_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_task_metrics_period ON task_performance_metrics(period_year, period_month);

-- ============================================================================
-- FUNCIÓN: Calcular métricas de tareas por usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_task_metrics(
  p_user_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS void AS $$
DECLARE
  v_agency_id UUID;
  v_total_assigned INTEGER;
  v_completed INTEGER;
  v_completed_on_time INTEGER;
  v_completed_late INTEGER;
  v_overdue INTEGER;
  v_avg_time INTEGER;
BEGIN
  -- Obtener agency_id del usuario
  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Contar tareas del período
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
  
  -- Calcular tiempo promedio de completado
  SELECT 
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60)::INTEGER
  INTO v_avg_time
  FROM tasks
  WHERE assigned_to = p_user_id
    AND status = 'completada'
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND deleted_at IS NULL;
  
  -- Insertar o actualizar métricas
  INSERT INTO task_performance_metrics (
    user_id,
    agency_id,
    period_month,
    period_year,
    total_tasks_assigned,
    tasks_completed,
    tasks_completed_on_time,
    tasks_completed_late,
    tasks_overdue,
    avg_completion_time_minutes
  ) VALUES (
    p_user_id,
    v_agency_id,
    p_month,
    p_year,
    v_total_assigned,
    v_completed,
    v_completed_on_time,
    v_completed_late,
    v_overdue,
    v_avg_time
  )
  ON CONFLICT (user_id, period_month, period_year)
  DO UPDATE SET
    total_tasks_assigned = v_total_assigned,
    tasks_completed = v_completed,
    tasks_completed_on_time = v_completed_on_time,
    tasks_completed_late = v_completed_late,
    tasks_overdue = v_overdue,
    avg_completion_time_minutes = v_avg_time,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Marcar tareas vencidas
-- ============================================================================
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE tasks
  SET status = 'vencida',
      updated_at = NOW()
  WHERE status = 'pendiente'
    AND due_date < NOW()
    AND deleted_at IS NULL;
    
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Auto-generar tarea de seguimiento de cliente
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_client_followup_tasks(
  p_days_threshold INTEGER DEFAULT 2
)
RETURNS TABLE(task_id UUID, contact_id UUID) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO tasks (
    agency_id,
    assigned_to,
    task_type,
    related_contact_id,
    title,
    description,
    priority,
    auto_generated,
    generation_rule,
    due_date
  )
  SELECT 
    c.agency_id,
    c.assigned_to,
    'cliente_seguimiento'::TEXT,
    c.id,
    'Cliente sin interacción - ' || c.first_name || ' ' || COALESCE(c.last_name, ''),
    'No has tenido interacción en ' || p_days_threshold || ' días con este cliente. Es importante dar seguimiento.',
    'alta'::TEXT,
    true,
    'cliente_sin_interaccion_' || p_days_threshold || '_dias',
    NOW() + INTERVAL '24 hours'
  FROM contacts c
  WHERE c.last_interaction_at < NOW() - (p_days_threshold || ' days')::INTERVAL
    AND c.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.related_contact_id = c.id
        AND t.task_type = 'cliente_seguimiento'
        AND t.status IN ('pendiente', 'en_proceso')
        AND t.deleted_at IS NULL
    )
  RETURNING id, related_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_tasks ON tasks;
CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_task_templates ON task_templates;
CREATE TRIGGER set_updated_at_task_templates
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- VISTA: Tareas con detalles
-- ============================================================================
CREATE OR REPLACE VIEW v_tasks_with_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.task_type,
  t.priority,
  t.status,
  t.due_date,
  t.auto_generated,
  t.created_at,
  t.completed_at,
  t.agency_id,
  t.assigned_to,
  t.related_contact_id,
  t.related_property_id,
  
  -- Usuario asignado
  up.first_name || ' ' || COALESCE(up.last_name, '') as assigned_to_name,
  up.avatar_url as assigned_to_avatar,
  
  -- Contacto relacionado
  c.first_name || ' ' || COALESCE(c.last_name, '') as contact_name,
  c.phone as contact_phone,
  c.email as contact_email,
  
  -- Propiedad relacionada
  p.title as property_title,
  p.sale_price,
  p.rent_price,
  
  -- Agencia
  a.name as agency_name
  
FROM tasks t
LEFT JOIN user_profiles up ON t.assigned_to = up.id
LEFT JOIN contacts c ON t.related_contact_id = c.id
LEFT JOIN properties p ON t.related_property_id = p.id
LEFT JOIN agencies a ON t.agency_id = a.id
WHERE t.deleted_at IS NULL;

-- ============================================================================
-- DATOS INICIALES: Templates predefinidos
-- ============================================================================

-- Template: Seguimiento de cliente
INSERT INTO task_templates (
  name,
  task_type,
  priority,
  title_template,
  description_template,
  auto_assign_to_owner
) VALUES (
  'Seguimiento de cliente sin interacción',
  'cliente_seguimiento',
  'alta',
  'Cliente sin interacción - {contact_name}',
  'No has tenido interacción en {days} días con este cliente. Es importante dar seguimiento para mantener el interés.',
  true
) ON CONFLICT DO NOTHING;

-- Template: Confirmar visita
INSERT INTO task_templates (
  name,
  task_type,
  priority,
  title_template,
  description_template,
  auto_assign_to_producer
) VALUES (
  'Confirmar visita pendiente',
  'visita_confirmar',
  'alta',
  'Visita pendiente de confirmar - {property_title}',
  'Tienes una visita programada. Confirma con el cliente y coordina con el vendedor.',
  true
) ON CONFLICT DO NOTHING;

-- Template: Mejorar health score
INSERT INTO task_templates (
  name,
  task_type,
  priority,
  title_template,
  description_template,
  auto_assign_to_producer
) VALUES (
  'Mejorar health score de propiedad',
  'propiedad_health_score',
  'media',
  'Mejorar calidad de {property_title}',
  'Esta propiedad tiene un health score bajo. Mejora las fotos, descripción y datos faltantes.',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS (permisos)
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT ON task_comments TO authenticated;
GRANT SELECT ON task_templates TO authenticated;
GRANT SELECT ON task_automation_log TO authenticated;
GRANT SELECT ON task_performance_metrics TO authenticated;
GRANT SELECT ON v_tasks_with_details TO authenticated;

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
