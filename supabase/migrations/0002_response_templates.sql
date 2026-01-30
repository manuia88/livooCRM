-- Migration: Create response_templates table
-- Description: Stores quick response templates for social inbox.

CREATE TABLE IF NOT EXISTS response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES user_profiles(id),
    
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- "all" or specific channel like "whatsapp"
    channel TEXT DEFAULT 'all', 
    category TEXT DEFAULT 'general',
    
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by agency
CREATE INDEX IF NOT EXISTS idx_response_templates_agency ON response_templates(agency_id);
