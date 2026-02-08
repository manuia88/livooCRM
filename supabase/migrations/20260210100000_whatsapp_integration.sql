-- =============================================
-- NEXUS OS - WhatsApp Integration
-- Migration: 20260210100000_whatsapp_integration
-- Description: Authentication and message logging for Baileys integration
-- =============================================

-- 1. WhatsApp Agency Auth (Stores Baileys session data and QR)
CREATE TABLE IF NOT EXISTS whatsapp_agency_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  phone_number TEXT, -- Number connected (e.g., +5215512345678)
  session_data JSONB, -- Creds from Baileys
  is_active BOOLEAN DEFAULT FALSE,
  last_qr_code TEXT, -- QR as base64 or string
  qr_generated_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index to ensure one active session per agency (can be relaxed later if needed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_agency_auth_active 
ON whatsapp_agency_auth(agency_id) 
WHERE is_active = TRUE;

-- 2. WhatsApp Messages (Logging for tracking)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Content
  phone_number TEXT NOT NULL, -- Recipient
  message TEXT NOT NULL,
  media_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed
  whatsapp_message_id TEXT, -- ID from WhatsApp
  error TEXT,
  
  -- Metadata
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact 
ON whatsapp_messages(contact_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_agency 
ON whatsapp_messages(agency_id, sent_at DESC);

-- RLS
ALTER TABLE whatsapp_agency_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get agency_id (if not already exists, using the one from migration 0004)
-- We assume auth.user_agency_id() exists as it was found in migration 0004.

-- Policies for whatsapp_agency_auth
CREATE POLICY "Users can view their agency WhatsApp auth"
ON whatsapp_agency_auth FOR SELECT
USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage their agency WhatsApp auth"
ON whatsapp_agency_auth FOR ALL
USING (
  agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
);

-- Policies for whatsapp_messages
CREATE POLICY "Users can view their agency WhatsApp messages"
ON whatsapp_messages FOR SELECT
USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert WhatsApp messages"
ON whatsapp_messages FOR INSERT
WITH CHECK (
  agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
  AND user_id = auth.uid()
);

-- Trigger for updated_at (using common function if exists)
CREATE TRIGGER update_whatsapp_agency_auth_updated_at
BEFORE UPDATE ON whatsapp_agency_auth
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
