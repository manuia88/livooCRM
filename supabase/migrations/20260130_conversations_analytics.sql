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
