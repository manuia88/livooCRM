-- =============================================
-- LIVOO CRM - Phase 7: WhatsApp Enhancement
-- Migration: 20260212000000_whatsapp_phase7
-- Description: Add whatsapp_sessions (connection state + QR),
--              enhance whatsapp_messages with direction/type,
--              add whatsapp_queue for rate-limited sending
-- =============================================

-- 1. WhatsApp Sessions - tracks connection state and QR for the UI
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  phone_number TEXT,
  status TEXT CHECK (status IN ('disconnected', 'connecting', 'waiting_scan', 'connected')) DEFAULT 'disconnected',
  qr_code TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_agency ON whatsapp_sessions(agency_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON whatsapp_sessions(status);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agency WhatsApp session"
  ON whatsapp_sessions FOR SELECT
  USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage their agency WhatsApp session"
  ON whatsapp_sessions FOR ALL
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- 2. WhatsApp Queue - for rate-limited sending and retries
CREATE TABLE IF NOT EXISTS whatsapp_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'sent', 'failed')) DEFAULT 'queued',
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_status ON whatsapp_queue(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_scheduled ON whatsapp_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_priority ON whatsapp_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_agency ON whatsapp_queue(agency_id);

ALTER TABLE whatsapp_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agency queue"
  ON whatsapp_queue FOR SELECT
  USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert to their agency queue"
  ON whatsapp_queue FOR INSERT
  WITH CHECK (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

-- 3. Add direction column to whatsapp_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_messages' AND column_name = 'direction'
  ) THEN
    ALTER TABLE whatsapp_messages ADD COLUMN direction TEXT CHECK (direction IN ('inbound', 'outbound'));
  END IF;
END $$;

-- 4. Add message_type column to whatsapp_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_messages' AND column_name = 'message_type'
  ) THEN
    ALTER TABLE whatsapp_messages ADD COLUMN message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')) DEFAULT 'text';
  END IF;
END $$;

-- 5. Add metadata column to whatsapp_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_messages' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE whatsapp_messages ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- 6. Triggers for updated_at
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_queue_updated_at
  BEFORE UPDATE ON whatsapp_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE whatsapp_sessions IS 'Tracks WhatsApp connection state, QR code, and session info per agency';
COMMENT ON TABLE whatsapp_queue IS 'Rate-limited message queue with retry support for anti-ban compliance';
