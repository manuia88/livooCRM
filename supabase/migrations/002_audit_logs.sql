-- ============================================================================
-- AUDIT LOGS TABLE WITH RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id UUID,
  action TEXT NOT NULL, -- 'login', 'logout', 'create_property', 'update_contact', etc.
  resource_type TEXT,   -- 'property', 'contact', 'user', 'message', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_id ON audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR AUDIT_LOGS
-- ============================================================================

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
USING (user_id = auth.uid());

-- Policy: Admins can view all audit logs from their agency
CREATE POLICY "Admins can view agency audit logs"
ON audit_logs FOR SELECT
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' AND
  agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
);

-- Policy: System can insert audit logs (no restrictions)
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION TO LOG AUDIT EVENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_agency_id UUID;
BEGIN
  -- Get user's agency_id
  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = auth.uid();

  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    agency_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    v_agency_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
