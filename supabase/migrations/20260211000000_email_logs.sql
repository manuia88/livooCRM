-- Email logs for tracking sent emails
-- Supports delivery tracking and analytics

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  template TEXT NOT NULL,
  recipient_emails TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT,
  status TEXT CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')) DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Performance indexes
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_template ON email_logs(template, sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_agency ON email_logs(agency_id, sent_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs USING GIN(recipient_emails);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email logs from their agency"
  ON email_logs
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- View for email analytics
CREATE OR REPLACE VIEW v_email_stats AS
SELECT
  agency_id,
  template,
  DATE_TRUNC('day', sent_at) AS day,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
  COUNT(*) FILTER (WHERE status = 'bounced') AS bounced,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened
FROM email_logs
GROUP BY agency_id, template, DATE_TRUNC('day', sent_at);
