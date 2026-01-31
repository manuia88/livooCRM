-- =============================================
-- NEXUS OS - Conversations Module Enhancement
-- Migration: 0016_conversations_templates_broadcasts
-- Description: Message templates, broadcast system, and rate limiting for anti-ban
-- =============================================

-- =============================================
-- MESSAGE TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES user_profiles(id),
    
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Variables that can be used: {{nombre_cliente}}, {{nombre_propiedad}}, etc.
    variables JSONB DEFAULT '[]',
    
    category TEXT CHECK (category IN ('greeting', 'follow_up', 'property_info', 'visit_confirmation', 'closing', 'custom')),
    
    -- Channel where this template can be used
    channels JSONB DEFAULT '["whatsapp", "sms", "email"]',
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BROADCAST SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES user_profiles(id) NOT NULL,
    
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
    
    -- Message Content
    template_id UUID REFERENCES message_templates(id),
    message_content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    
    -- Recipient Segmentation
    segment_criteria JSONB DEFAULT '{}',
    -- Example: {"type": "buyer", "lead_score_min": 50, "tags": ["interesado"]}
    
    -- Scheduling
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    
    -- Results
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    
    -- Error tracking
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BROADCAST RECIPIENTS
-- =============================================

CREATE TABLE IF NOT EXISTS broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID REFERENCES broadcasts(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) NOT NULL,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'read', 'replied')),
    
    -- Personalized message (with variables replaced)
    personalized_message TEXT,
    personalized_media_urls JSONB DEFAULT '[]',
    
    -- External IDs
    platform_message_id TEXT,
    
    -- Timestamps
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RATE LIMITING (ANTI-BAN SYSTEM)
-- =============================================

CREATE TABLE IF NOT EXISTS whatsapp_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    phone_number TEXT NOT NULL,
    
    -- Configurable Limits
    messages_per_minute INTEGER DEFAULT 10,
    messages_per_hour INTEGER DEFAULT 100,
    messages_per_day INTEGER DEFAULT 1000,
    
    -- Current Usage Counters
    minute_count INTEGER DEFAULT 0,
    hour_count INTEGER DEFAULT 0,
    day_count INTEGER DEFAULT 0,
    
    -- Reset Timestamps
    minute_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 minute',
    hour_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
    day_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
    
    -- Warm-up Period (for new numbers)
    is_warming_up BOOLEAN DEFAULT true,
    warmup_started_at TIMESTAMPTZ DEFAULT NOW(),
    warmup_days INTEGER DEFAULT 7,
    
    -- Ban Protection
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMPTZ,
    blocked_until TIMESTAMPTZ,
    blocked_reason TEXT,
    ban_count INTEGER DEFAULT 0,
    
    -- Health Metrics
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    delivery_rate NUMERIC(5,2) DEFAULT 0,
    
    last_message_sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, phone_number)
);

-- =============================================
-- WHATSAPP CONFIG
-- =============================================

CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    phone_number TEXT NOT NULL,
    display_name TEXT,
    
    -- Connection Status
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error', 'banned')),
    
    -- API Configuration
    api_provider TEXT CHECK (api_provider IN ('official', 'whatsapp_web', 'twilio', 'messagebird', 'custom')),
    api_credentials JSONB DEFAULT '{}',
    
    -- QR Code (for web-based connections)
    qr_code TEXT,
    qr_code_expires_at TIMESTAMPTZ,
    
    -- Session Info
    wa_session_id TEXT,
    last_connected_at TIMESTAMPTZ,
    last_disconnected_at TIMESTAMPTZ,
    
    -- Settings
    auto_reconnect BOOLEAN DEFAULT true,
    send_read_receipts BOOLEAN DEFAULT true,
    save_media BOOLEAN DEFAULT true,
    
    -- Webhooks
    webhook_url TEXT,
    webhook_secret TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, phone_number)
);

-- =============================================
-- QUICK REPLIES (For faster responses)
-- =============================================

CREATE TABLE IF NOT EXISTS quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    
    shortcut TEXT NOT NULL,  -- e.g., "/hola", "/precio"
    content TEXT NOT NULL,
    
    -- Variables support
    variables JSONB DEFAULT '[]',
    
    category TEXT,
    
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, user_id, shortcut)
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check if can send message (rate limiting)
CREATE OR REPLACE FUNCTION can_send_whatsapp_message(
    p_agency_id UUID,
    p_phone_number TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_limit RECORD;
    v_current_time TIMESTAMPTZ := NOW();
BEGIN
    -- Get rate limit record
    SELECT * INTO v_limit 
    FROM whatsapp_rate_limits 
    WHERE agency_id = p_agency_id 
    AND phone_number = p_phone_number;
    
    IF NOT FOUND THEN
        -- No limit record, allow (will be created on first send)
        RETURN true;
    END IF;
    
    -- Check if blocked
    IF v_limit.is_blocked THEN
        IF v_limit.blocked_until IS NOT NULL AND v_limit.blocked_until > v_current_time THEN
            RETURN false;
        END IF;
    END IF;
    
    -- Reset counters if needed
    IF v_limit.minute_reset_at <= v_current_time THEN
        UPDATE whatsapp_rate_limits 
        SET minute_count = 0,
            minute_reset_at = v_current_time + INTERVAL '1 minute'
        WHERE id = v_limit.id;
        v_limit.minute_count := 0;
    END IF;
    
    IF v_limit.hour_reset_at <= v_current_time THEN
        UPDATE whatsapp_rate_limits 
        SET hour_count = 0,
            hour_reset_at = v_current_time + INTERVAL '1 hour'
        WHERE id = v_limit.id;
        v_limit.hour_count := 0;
    END IF;
    
    IF v_limit.day_reset_at <= v_current_time THEN
        UPDATE whatsapp_rate_limits 
        SET day_count = 0,
            day_reset_at = v_current_time + INTERVAL '1 day'
        WHERE id = v_limit.id;
        v_limit.day_count := 0;
    END IF;
    
    -- Check limits (use reduced limits during warmup)
    DECLARE
        v_minute_limit INTEGER := v_limit.messages_per_minute;
        v_hour_limit INTEGER := v_limit.messages_per_hour;
        v_day_limit INTEGER := v_limit.messages_per_day;
    BEGIN
        IF v_limit.is_warming_up THEN
            v_minute_limit := LEAST(v_minute_limit, 5);
            v_hour_limit := LEAST(v_hour_limit, 50);
            v_day_limit := LEAST(v_day_limit, 200);
        END IF;
        
        IF v_limit.minute_count >= v_minute_limit THEN
            RETURN false;
        END IF;
        
        IF v_limit.hour_count >= v_hour_limit THEN
            RETURN false;
        END IF;
        
        IF v_limit.day_count >= v_day_limit THEN
            RETURN false;
        END IF;
    END;
    
    RETURN true;
END;
$$;

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_whatsapp_usage(
    p_agency_id UUID,
    p_phone_number TEXT,
    p_success BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO whatsapp_rate_limits (
        agency_id,
        phone_number,
        minute_count,
        hour_count,
        day_count,
        total_sent,
        total_delivered,
        total_failed,
        last_message_sent_at
    ) VALUES (
        p_agency_id,
        p_phone_number,
        1,
        1,
        1,
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        NOW()
    )
    ON CONFLICT (agency_id, phone_number)
    DO UPDATE SET
        minute_count = whatsapp_rate_limits.minute_count + 1,
        hour_count = whatsapp_rate_limits.hour_count + 1,
        day_count = whatsapp_rate_limits.day_count + 1,
        total_sent = whatsapp_rate_limits.total_sent + 1,
        total_delivered = whatsapp_rate_limits.total_delivered + CASE WHEN p_success THEN 1 ELSE 0 END,
        total_failed = whatsapp_rate_limits.total_failed + CASE WHEN p_success THEN 0 ELSE 1 END,
        delivery_rate = ROUND(
            ((whatsapp_rate_limits.total_delivered + CASE WHEN p_success THEN 1 ELSE 0 END)::NUMERIC / 
            (whatsapp_rate_limits.total_sent + 1)::NUMERIC * 100)::NUMERIC, 
            2
        ),
        last_message_sent_at = NOW(),
        updated_at = NOW();
END;
$$;

-- Function to parse template variables
CREATE OR REPLACE FUNCTION parse_message_template(
    p_template TEXT,
    p_contact_id UUID,
    p_property_id UUID DEFAULT NULL,
    p_agent_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result TEXT := p_template;
    v_contact RECORD;
    v_property RECORD;
    v_agent RECORD;
BEGIN
    -- Get contact data
    IF p_contact_id IS NOT NULL THEN
        SELECT * INTO v_contact FROM contacts WHERE id = p_contact_id;
        
        v_result := REPLACE(v_result, '{{nombre_cliente}}', COALESCE(v_contact.first_name, ''));
        v_result := REPLACE(v_result, '{{apellido_cliente}}', COALESCE(v_contact.last_name, ''));
        v_result := REPLACE(v_result, '{{email_cliente}}', COALESCE(v_contact.email, ''));
        v_result := REPLACE(v_result, '{{telefono_cliente}}', COALESCE(v_contact.phone, ''));
    END IF;
    
    -- Get property data
    IF p_property_id IS NOT NULL THEN
        SELECT * INTO v_property FROM properties WHERE id = p_property_id;
        
        v_result := REPLACE(v_result, '{{nombre_propiedad}}', COALESCE(v_property.title, ''));
        v_result := REPLACE(v_result, '{{precio}}', COALESCE(v_property.sale_price::TEXT, v_property.rent_price::TEXT, ''));
        v_result := REPLACE(v_result, '{{moneda}}', COALESCE(v_property.currency, 'MXN'));
        v_result := REPLACE(v_result, '{{direccion}}', COALESCE(v_property.street, ''));
        v_result := REPLACE(v_result, '{{ciudad}}', COALESCE(v_property.city, ''));
    END IF;
    
    -- Get agent data
    IF p_agent_id IS NOT NULL THEN
        SELECT * INTO v_agent FROM user_profiles WHERE id = p_agent_id;
        
        v_result := REPLACE(v_result, '{{nombre_agente}}', COALESCE(v_agent.full_name, ''));
        v_result := REPLACE(v_result, '{{telefono_agente}}', COALESCE(v_agent.phone, ''));
        v_result := REPLACE(v_result, '{{whatsapp_agente}}', COALESCE(v_agent.whatsapp, ''));
    END IF;
    
    RETURN v_result;
END;
$$;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_message_templates_agency_id ON message_templates(agency_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_broadcasts_agency_id ON broadcasts(agency_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled_at ON broadcasts(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast_id ON broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_contact_id ON broadcast_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON broadcast_recipients(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_rate_limits_agency_phone ON whatsapp_rate_limits(agency_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_agency_id ON whatsapp_connections(agency_id);

CREATE INDEX IF NOT EXISTS idx_quick_replies_agency_user ON quick_replies(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_shortcut ON quick_replies(shortcut);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Message Templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates from their agency"
    ON message_templates FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create templates for their agency"
    ON message_templates FOR INSERT
    WITH CHECK (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their agency templates"
    ON message_templates FOR UPDATE
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their agency templates"
    ON message_templates FOR DELETE
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

-- Broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view broadcasts from their agency"
    ON broadcasts FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create broadcasts for their agency"
    ON broadcasts FOR INSERT
    WITH CHECK (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their agency broadcasts"
    ON broadcasts FOR UPDATE
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

-- Broadcast Recipients
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients from their agency broadcasts"
    ON broadcast_recipients FOR SELECT
    USING (
        broadcast_id IN (
            SELECT id FROM broadcasts 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage recipients for their agency broadcasts"
    ON broadcast_recipients FOR ALL
    USING (
        broadcast_id IN (
            SELECT id FROM broadcasts 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
    );

-- WhatsApp Rate Limits
ALTER TABLE whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rate limits for their agency"
    ON whatsapp_rate_limits FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

-- WhatsApp Connections
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections from their agency"
    ON whatsapp_connections FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage connections"
    ON whatsapp_connections FOR ALL
    USING (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    );

-- Quick Replies
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quick replies from their agency"
    ON quick_replies FOR SELECT
    USING (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND (user_id IS NULL OR user_id = auth.uid())
    );

CREATE POLICY "Users can manage their own quick replies"
    ON quick_replies FOR ALL
    USING (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND user_id = auth.uid()
    );
