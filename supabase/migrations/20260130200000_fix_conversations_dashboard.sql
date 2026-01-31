-- ============================================================================
-- NEXUS OS - CONVERSACIONES V2 Y ANALYTICS
-- Migration: 20260130_conversations_analytics.sql
-- ============================================================================

-- ============================================================================
-- 1. CONVERSACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES user_profiles(id),
  
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'facebook', 'instagram', 'telegram', 'email', 'sms')),
  channel_identifier TEXT NOT NULL, -- phone number, fb id, etc
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'spam', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, channel, channel_identifier)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'contact', 'system', 'bot')),
  sender_id UUID, -- user_id if agent, contact_id if contact
  sender_name TEXT,
  
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'audio', 'document', 
    'location', 'property_share', 'contact_card', 'template'
  )),
  
  media_url TEXT,
  media_type TEXT,
  media_size INTEGER,
  thumbnail_url TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  -- WhatsApp specific
  whatsapp_message_id TEXT,
  whatsapp_status TEXT CHECK (whatsapp_status IN ('sent', 'delivered', 'read', 'failed')),
  
  -- Message status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  
  -- Reply info
  reply_to_id UUID REFERENCES messages(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  
  name TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  
  -- WhatsApp template info
  whatsapp_template_id TEXT,
  whatsapp_approved BOOLEAN DEFAULT false,
  
  variables JSONB DEFAULT '[]', -- ['nombre', 'propiedad', 'precio']
  
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcast_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  
  name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  template_id UUID REFERENCES message_templates(id),
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  
  -- Segmentation
  target_contacts JSONB, -- Array of contact_ids or filter criteria
  total_recipients INTEGER,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_agency ON conversations(agency_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON conversations(unread_count) WHERE unread_count > 0;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_whatsapp_id ON messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

CREATE INDEX IF NOT EXISTS idx_templates_agency ON message_templates(agency_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON message_templates(category);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users see conversations from their agency" ON conversations;
CREATE POLICY "Users see conversations from their agency"
ON conversations FOR SELECT
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users update conversations from their agency" ON conversations;
CREATE POLICY "Users update conversations from their agency"
ON conversations FOR UPDATE
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users insert conversations for their agency" ON conversations;
CREATE POLICY "Users insert conversations for their agency"
ON conversations FOR INSERT
WITH CHECK (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users see messages from their agency conversations" ON messages;
CREATE POLICY "Users see messages from their agency conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE agency_id IN (
      SELECT agency_id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users insert messages for their agency conversations" ON messages;
CREATE POLICY "Users insert messages for their agency conversations"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations WHERE agency_id IN (
      SELECT agency_id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Template Policies
DROP POLICY IF EXISTS "Users see templates from their agency" ON message_templates;
CREATE POLICY "Users see templates from their agency"
ON message_templates FOR SELECT
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));


-- ============================================================================
-- 2. ANALYTICS (KPIs, Views, Leaderboard)
-- ============================================================================

-- Function to calculate Agent Leaderboard
CREATE OR REPLACE FUNCTION get_agent_leaderboard(
  p_agency_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  avatar_url TEXT,
  sales_volume NUMERIC,
  deals_closed INTEGER,
  new_leads INTEGER,
  tasks_completed INTEGER,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id as agent_id,
    (up.first_name || ' ' || COALESCE(up.last_name, ''))::TEXT as agent_name,
    up.avatar_url,
    COALESCE(SUM(p.sale_price) FILTER (WHERE p.status = 'vendida'), 0) as sales_volume,
    COUNT(p.id) FILTER (WHERE p.status = 'vendida')::INTEGER as deals_closed,
    COUNT(c.id)::INTEGER as new_leads,
    COALESCE(tm.tasks_completed, 0)::INTEGER as tasks_completed,
    CASE 
      WHEN COUNT(c.id) > 0 THEN 
        ROUND((COUNT(p.id) FILTER (WHERE p.status = 'vendida')::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM user_profiles up
  LEFT JOIN properties p ON p.producer_id = up.id AND EXTRACT(MONTH FROM p.updated_at) = p_month AND EXTRACT(YEAR FROM p.updated_at) = p_year
  LEFT JOIN contacts c ON c.assigned_to = up.id AND EXTRACT(MONTH FROM c.created_at) = p_month AND EXTRACT(YEAR FROM c.created_at) = p_year
  LEFT JOIN task_performance_metrics tm ON tm.user_id = up.id AND tm.period_month = p_month AND tm.period_year = p_year
  WHERE up.agency_id = p_agency_id
  GROUP BY up.id, up.first_name, up.last_name, up.avatar_url, tm.tasks_completed
  ORDER BY sales_volume DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get Pipeline Funnel
CREATE OR REPLACE FUNCTION get_pipeline_funnel(
  p_agency_id UUID
)
RETURNS TABLE (
  stage TEXT,
  count INTEGER,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.status as stage,
    COUNT(*)::INTEGER as count,
    0::NUMERIC as value -- Placeholder if we don't track value per lead yet
  FROM contacts c
  WHERE c.agency_id = p_agency_id
  GROUP BY c.status
  ORDER BY 
    CASE c.status
      WHEN 'nuevo' THEN 1
      WHEN 'contactado' THEN 2
      WHEN 'calificado' THEN 3
      WHEN 'propuesta' THEN 4
      WHEN 'negociacion' THEN 5
      WHEN 'ganado' THEN 6
      ELSE 7
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON message_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON broadcast_campaigns TO authenticated;
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

CREATE INDEX IF NOT EXISTS idx_user_objectives_user ON user_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_user_objectives_period ON user_objectives(period, end_date);

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

CREATE INDEX IF NOT EXISTS idx_priority_actions_user ON priority_actions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_priority_actions_priority ON priority_actions(priority_level DESC);
CREATE INDEX IF NOT EXISTS idx_priority_actions_type ON priority_actions(action_type);

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

CREATE INDEX IF NOT EXISTS idx_quick_actions_user ON quick_actions(user_id, order_index);

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

CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user ON conversation_summaries(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_priority ON conversation_summaries(priority_score DESC);

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
  v_temp_count INTEGER := 0;
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
  
  GET DIAGNOSTICS v_temp_count = ROW_COUNT;
  v_actions_created := v_actions_created + v_temp_count;
  
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
