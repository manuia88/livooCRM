-- =============================================
-- LIVOO CRM - Portal Publishing System (Complementary)
-- Migration: 20260211_portal_publishing
-- Description: Add portal_configs (agency-level) and publication_logs for audit trail
-- Complements: 0015_properties_mls_sharing.sql (property_portals table)
-- =============================================

-- =============================================
-- 1. AGENCY-LEVEL PORTAL CONFIGURATION
-- =============================================
-- Each agency configures their portal credentials independently
CREATE TABLE IF NOT EXISTS portal_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    portal TEXT NOT NULL CHECK (portal IN (
        'inmuebles24', 'vivanuncios', 'lamudi',
        'properati', 'metroscubicos', 'mercadolibre',
        'propiedades_com'
    )),
    enabled BOOLEAN DEFAULT FALSE,

    -- API Credentials (encrypted at app level)
    credentials JSONB NOT NULL DEFAULT '{}',

    -- Portal-specific settings
    settings JSONB DEFAULT '{
        "auto_publish": false,
        "sync_frequency": "manual",
        "default_contact": null,
        "publish_draft": false,
        "auto_sync_price": true,
        "auto_sync_photos": true
    }',

    -- Connection health
    last_connection_test TIMESTAMPTZ,
    connection_status TEXT CHECK (connection_status IN ('connected', 'error', 'untested')) DEFAULT 'untested',
    connection_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agency_id, portal)
);

-- =============================================
-- 2. PUBLICATION AUDIT LOGS
-- =============================================
-- Detailed log of every action taken on portal publications
CREATE TABLE IF NOT EXISTS publication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    property_portal_id UUID REFERENCES property_portals(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    portal TEXT NOT NULL,

    -- Action details
    action TEXT NOT NULL CHECK (action IN (
        'create', 'update', 'delete', 'sync',
        'pause', 'resume', 'error_retry',
        'status_change', 'credentials_test'
    )),
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),

    -- Request/Response tracking
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,

    -- Who triggered it
    triggered_by UUID REFERENCES user_profiles(id),
    triggered_type TEXT CHECK (triggered_type IN ('manual', 'auto_sync', 'webhook', 'system')) DEFAULT 'manual',

    -- Timing
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_portal_configs_agency ON portal_configs(agency_id);
CREATE INDEX IF NOT EXISTS idx_portal_configs_portal ON portal_configs(portal);
CREATE INDEX IF NOT EXISTS idx_portal_configs_enabled ON portal_configs(agency_id, enabled) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_publication_logs_property ON publication_logs(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_logs_portal ON publication_logs(portal, status);
CREATE INDEX IF NOT EXISTS idx_publication_logs_agency ON publication_logs(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_logs_property_portal ON publication_logs(property_portal_id, created_at DESC);

-- =============================================
-- 4. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_logs ENABLE ROW LEVEL SECURITY;

-- Portal Configs: Users see their agency's configs
CREATE POLICY "Users can view their agency portal configs"
    ON portal_configs FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage their agency portal configs"
    ON portal_configs FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Publication Logs: Users see logs for their agency
CREATE POLICY "Users can view their agency publication logs"
    ON publication_logs FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert publication logs"
    ON publication_logs FOR INSERT
    WITH CHECK (
        agency_id IN (
            SELECT agency_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =============================================
-- 5. AUTO-UPDATE TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_portal_configs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_portal_configs_updated_at ON portal_configs;
CREATE TRIGGER trigger_portal_configs_updated_at
    BEFORE UPDATE ON portal_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_portal_configs_updated_at();

-- =============================================
-- 6. DOCUMENTATION
-- =============================================

COMMENT ON TABLE portal_configs IS 'Agency-level configuration for external portal integrations (credentials, settings)';
COMMENT ON TABLE publication_logs IS 'Audit trail for all portal publishing actions (create, update, sync, errors)';
COMMENT ON COLUMN portal_configs.credentials IS 'Encrypted API credentials: { api_key, api_secret, account_id }';
COMMENT ON COLUMN portal_configs.settings IS 'Portal behavior settings: auto_publish, sync_frequency, etc.';
COMMENT ON COLUMN publication_logs.duration_ms IS 'API call duration in milliseconds for performance monitoring';
