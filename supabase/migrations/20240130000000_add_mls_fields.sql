-- Add MLS fields to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS commission_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS mls_views INTEGER DEFAULT 0;

-- Create search_alerts table
CREATE TABLE IF NOT EXISTS search_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'instant')),
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for search_alerts
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
    ON search_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
    ON search_alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
    ON search_alerts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
    ON search_alerts FOR DELETE
    USING (auth.uid() = user_id);
