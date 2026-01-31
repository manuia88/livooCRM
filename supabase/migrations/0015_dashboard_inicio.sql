-- ============================================================================
-- LIVOO CRM - MÓDULO DE DASHBOARD E INICIO
-- Migration: 0015_dashboard_inicio.sql
-- Descripción: Sistema de dashboard principal con widgets y prioridades
-- ============================================================================

-- ============================================================================
-- TABLA: user_objectives (Objetivos de usuario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Objetivo
  period TEXT CHECK (period IN ('monthly', 'quarterly', 'yearly')),
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  
  -- Fechas
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Tracking
  operations_count INTEGER DEFAULT 0,
  percentage_achieved NUMERIC(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_objectives_user ON user_objectives(user_id);
CREATE INDEX idx_user_objectives_period ON user_objectives(period, end_date);

-- ============================================================================
-- TABLA: user_levels (Niveles de broker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE, -- 'Broker Profesional', 'Broker Elite', etc.
  min_operations INTEGER NOT NULL,
  min_revenue NUMERIC(15,2) NOT NULL,
  
  benefits JSONB DEFAULT '[]', -- Beneficios del nivel
  color TEXT, -- Color del badge
  icon TEXT, -- URL del ícono
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar niveles base
INSERT INTO user_levels (name, min_operations, min_revenue, color) VALUES
('Broker Inicial', 0, 0, '#9CA3AF'),
('Broker Profesional', 5, 100000, '#3B82F6'),
('Broker Elite', 20, 500000, '#EAB308'),
('Broker Master', 50, 1500000, '#8B5CF6'),
('Broker Legend', 100, 5000000, '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- TABLA: priority_actions (Acciones prioritarias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS priority_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Tipo de acción
  action_type TEXT NOT NULL CHECK (action_type IN (
    'suspended_advisor',
    'expired_offer', 
    'overdue_task',
    'pending_course',
    'pending_consultation',
    'low_quality_property',
    'unlinked_whatsapp',
    'missing_documentation'
  )),
  
  -- Prioridad
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  
  -- Información
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT, -- URL a donde debe ir
  
  -- Referencias
  reference_type TEXT, -- 'property', 'task', 'user', 'consultation'
  reference_id UUID,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_priority_actions_user ON priority_actions(user_id, status);
CREATE INDEX idx_priority_actions_priority ON priority_actions(priority_level DESC);
CREATE INDEX idx_priority_actions_type ON priority_actions(action_type);

-- ============================================================================
-- TABLA: quick_actions (Accesos rápidos personalizados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quick_actions_user ON quick_actions(user_id, order_index);

-- ============================================================================
-- TABLA: conversation_summaries (Resumen de conversaciones para dashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  
  -- Para ordenamiento en dashboard
  is_pinned BOOLEAN DEFAULT FALSE,
  priority_score INTEGER DEFAULT 0, -- Calculado: respuestas pendientes, tiempo sin responder, etc.
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_summaries_user ON conversation_summaries(user_id, last_message_at DESC);
CREATE INDEX idx_conversation_summaries_priority ON conversation_summaries(priority_score DESC);

-- ============================================================================
-- FUNCIÓN: Calcular nivel de usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_operations_count INTEGER;
  v_total_revenue NUMERIC;
  v_level_name TEXT;
BEGIN
  -- Contar operaciones del último año
  SELECT 
    COUNT(*),
    COALESCE(SUM(commission_total), 0)
  INTO v_operations_count, v_total_revenue
  FROM operations
  WHERE (producer_id = p_user_id OR seller_id = p_user_id OR buyer_agent_id = p_user_id)
    AND status = 'completed'
    AND created_at >= NOW() - INTERVAL '1 year';
  
  -- Determinar nivel
  SELECT name INTO v_level_name
  FROM user_levels
  WHERE min_operations <= v_operations_count
    AND min_revenue <= v_total_revenue
  ORDER BY min_revenue DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level_name, 'Broker Inicial');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Generar acciones prioritarias automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_priority_actions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_actions_created INTEGER := 0;
  v_agency_id UUID;
BEGIN
  -- Obtener agency del usuario
  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Limpiar acciones viejas completadas (más de 30 días)
  DELETE FROM priority_actions
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND completed_at < NOW() - INTERVAL '30 days';
  
  -- 1. Detectar ofertas vencidas (no implementadas todavía en operations)
  -- Se implementará cuando tengamos el módulo de ofertas
  
  -- 2. Detectar tareas atrasadas
  INSERT INTO priority_actions (
    user_id, agency_id, action_type, priority_level,
    title, description, action_url, reference_type, reference_id
  )
  SELECT 
    p_user_id,
    v_agency_id,
    'overdue_task',
    3, -- Alta prioridad
    'Tareas atrasadas',
    COUNT(*)::TEXT || ' tarea(s) atrasada(s)',
    '/dashboard/tasks',
    'task',
    NULL
  FROM tasks
  WHERE assigned_to = p_user_id
    AND status = 'pending'
    AND due_date < NOW()
    AND NOT EXISTS (
      SELECT 1 FROM priority_actions
      WHERE user_id = p_user_id
        AND action_type = 'overdue_task'
        AND status = 'pending'
    )
  HAVING COUNT(*) > 0;
  
  GET DIAGNOSTICS v_actions_created = ROW_COUNT;
  
  -- 3. Detectar propiedades con health score bajo
  INSERT INTO priority_actions (
    user_id, agency_id, action_type, priority_level,
    title, description, action_url, reference_type, reference_id
  )
  SELECT 
    p_user_id,
    v_agency_id,
    'low_quality_property',
    2, -- Media prioridad
    'Propiedades con calidad baja',
    COUNT(*)::TEXT || ' propiedad(es) con health score < 60%',
    '/dashboard/properties?filter=low_health',
    'property',
    NULL
  FROM properties
  WHERE producer_id = p_user_id
    AND health_score < 60
    AND deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM priority_actions
      WHERE user_id = p_user_id
        AND action_type = 'low_quality_property'
        AND status = 'pending'
    )
  HAVING COUNT(*) > 0;
  
  GET DIAGNOSTICS v_actions_created = v_actions_created + ROW_COUNT;
  
  RETURN v_actions_created;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Obtener resumen del dashboard
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_objective RECORD;
  v_level TEXT;
BEGIN
  -- Obtener objetivo actual
  SELECT * INTO v_objective
  FROM user_objectives
  WHERE user_id = p_user_id
    AND end_date >= CURRENT_DATE
  ORDER BY end_date ASC
  LIMIT 1;
  
  -- Calcular nivel
  v_level := calculate_user_level(p_user_id);
  
  -- Construir JSON de respuesta
  SELECT json_build_object(
    'user_level', v_level,
    'objective', json_build_object(
      'target', COALESCE(v_objective.target_amount, 0),
      'current', COALESCE(v_objective.current_amount, 0),
      'percentage', COALESCE(v_objective.percentage_achieved, 0),
      'period', COALESCE(v_objective.period, 'monthly')
    ),
    'priority_actions_count', (
      SELECT COUNT(*)
      FROM priority_actions
      WHERE user_id = p_user_id AND status = 'pending'
    ),
    'pending_tasks_count', (
      SELECT COUNT(*)
      FROM tasks
      WHERE assigned_to = p_user_id AND status = 'pending'
    ),
    'active_properties_count', (
      SELECT COUNT(*)
      FROM properties
      WHERE producer_id = p_user_id AND deleted_at IS NULL AND status = 'disponible'
    ),
    'unread_conversations_count', (
      SELECT COALESCE(SUM(unread_count), 0)
      FROM conversations
      WHERE assigned_to = p_user_id AND status = 'active'
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users see their own objectives"
ON user_objectives FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users see their own priority actions"
ON priority_actions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage their own quick actions"
ON quick_actions FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users see their conversation summaries"
ON conversation_summaries FOR SELECT
USING (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON user_objectives TO authenticated;
GRANT SELECT, UPDATE ON priority_actions TO authenticated;
GRANT ALL ON quick_actions TO authenticated;
GRANT SELECT ON conversation_summaries TO authenticated;
GRANT SELECT ON user_levels TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_user_level TO authenticated;
GRANT EXECUTE ON FUNCTION generate_priority_actions TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_summary TO authenticated;

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
