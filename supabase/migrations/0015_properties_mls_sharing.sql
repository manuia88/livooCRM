-- =============================================
-- NEXUS OS - Properties MLS & Sharing System
-- Migration: 0015_properties_mls_sharing
-- Description: Add MLS sharing, property shares tracking, portal publishing, and health score system
-- =============================================

-- Add missing MLS sharing fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS mls_shared_with UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS share_mode TEXT CHECK (share_mode IN ('white_label', 'mls', 'original')),
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_shared_at TIMESTAMPTZ;

-- Property Shares Tracking Table
CREATE TABLE IF NOT EXISTS property_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES user_profiles(id) NOT NULL,
    shared_with UUID REFERENCES user_profiles(id),
    
    -- Share Configuration
    share_mode TEXT NOT NULL CHECK (share_mode IN ('white_label', 'mls', 'original')),
    share_link TEXT NOT NULL UNIQUE,
    share_token TEXT NOT NULL UNIQUE,
    
    -- White Label Options
    custom_agent_name TEXT,
    custom_agent_phone TEXT,
    custom_agent_email TEXT,
    custom_agency_name TEXT,
    
    -- Analytics
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Share Views (Analytics)
CREATE TABLE IF NOT EXISTS property_share_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID REFERENCES property_shares(id) ON DELETE CASCADE NOT NULL,
    
    -- Visitor Info
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Location (if available)
    country TEXT,
    city TEXT,
    
    -- Activity
    duration_seconds INTEGER,
    
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Portal Publishing
CREATE TABLE IF NOT EXISTS property_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    
    portal_name TEXT NOT NULL CHECK (portal_name IN (
        'inmuebles24', 'vivanuncios', 'mercadolibre', 'lamudi', 
        'propiedades_com', 'custom'
    )),
    
    -- Portal Integration
    portal_listing_id TEXT,
    portal_url TEXT,
    
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'error', 'removed')),
    
    -- Sync Status
    last_synced_at TIMESTAMPTZ,
    sync_error TEXT,
    sync_attempts INTEGER DEFAULT 0,
    
    -- Portal-specific settings
    portal_settings JSONB DEFAULT '{}',
    
    -- Analytics
    views_on_portal INTEGER DEFAULT 0,
    contacts_from_portal INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(property_id, portal_name)
);

-- =============================================
-- HEALTH SCORE CALCULATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION calculate_property_health_score(prop_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
    photo_count INTEGER;
    video_count INTEGER;
    doc_count INTEGER;
    amenity_count INTEGER;
    description_length INTEGER;
BEGIN
    -- Get property data
    SELECT * INTO prop FROM properties WHERE id = prop_id;
    
    IF prop.id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count multimedia and features
    photo_count := jsonb_array_length(COALESCE(prop.photos, '[]'::jsonb));
    video_count := jsonb_array_length(COALESCE(prop.videos, '[]'::jsonb));
    amenity_count := jsonb_array_length(COALESCE(prop.amenities, '[]'::jsonb));
    description_length := LENGTH(COALESCE(prop.description, ''));
    
    -- Get document count
    SELECT COUNT(*) INTO doc_count 
    FROM property_documents 
    WHERE property_id = prop_id;
    
    -- GPS Coordinates (10 points)
    IF prop.coordinates IS NOT NULL THEN 
        score := score + 10; 
    END IF;
    
    -- Photos (20 points total)
    -- 15+ photos = 20 points, 10+ = 15 points, 5+ = 10 points
    IF photo_count >= 15 THEN 
        score := score + 20;
    ELSIF photo_count >= 10 THEN
        score := score + 15;
    ELSIF photo_count >= 5 THEN
        score := score + 10;
    ELSIF photo_count >= 1 THEN
        score := score + 5;
    END IF;
    
    -- Video (20 points)
    IF video_count > 0 THEN 
        score := score + 20; 
    END IF;
    
    -- Virtual Tour (15 points)
    IF prop.virtual_tour_url IS NOT NULL AND LENGTH(prop.virtual_tour_url) > 0 THEN 
        score := score + 15; 
    END IF;
    
    -- Description (20 points total)
    -- 200+ chars = 20 points, 100+ = 15 points, 50+ = 10 points
    IF description_length >= 200 THEN 
        score := score + 20;
    ELSIF description_length >= 100 THEN
        score := score + 15;
    ELSIF description_length >= 50 THEN
        score := score + 10;
    ELSIF description_length >= 20 THEN
        score := score + 5;
    END IF;
    
    -- Owner Documents (10 points)
    IF doc_count > 0 THEN 
        score := score + 10; 
    END IF;
    
    -- Amenities (5 points)
    IF amenity_count >= 5 THEN 
        score := score + 5; 
    ELSIF amenity_count >= 3 THEN
        score := score + 3;
    ELSIF amenity_count >= 1 THEN
        score := score + 1;
    END IF;
    
    -- Cap at 100
    IF score > 100 THEN
        score := 100;
    END IF;
    
    RETURN score;
END;
$$;

-- =============================================
-- TRIGGER TO AUTO-UPDATE HEALTH SCORE
-- =============================================

CREATE OR REPLACE FUNCTION trigger_update_property_health_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Calculate and update health score
    NEW.health_score := calculate_property_health_score(NEW.id);
    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_update_property_health_score ON properties;

CREATE TRIGGER auto_update_property_health_score
    BEFORE UPDATE ON properties
    FOR EACH ROW
    WHEN (
        OLD.photos IS DISTINCT FROM NEW.photos OR
        OLD.videos IS DISTINCT FROM NEW.videos OR
        OLD.virtual_tour_url IS DISTINCT FROM NEW.virtual_tour_url OR
        OLD.description IS DISTINCT FROM NEW.description OR
        OLD.amenities IS DISTINCT FROM NEW.amenities OR
        OLD.coordinates IS DISTINCT FROM NEW.coordinates
    )
    EXECUTE FUNCTION trigger_update_property_health_score();

-- =============================================
-- FUNCTION TO GET HEALTH SCORE BREAKDOWN
-- =============================================

CREATE OR REPLACE FUNCTION get_property_health_score_breakdown(prop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prop RECORD;
    photo_count INTEGER;
    video_count INTEGER;
    doc_count INTEGER;
    amenity_count INTEGER;
    description_length INTEGER;
    breakdown JSONB;
    suggestions TEXT[];
BEGIN
    -- Get property data
    SELECT * INTO prop FROM properties WHERE id = prop_id;
    
    IF prop.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;
    
    -- Count items
    photo_count := jsonb_array_length(COALESCE(prop.photos, '[]'::jsonb));
    video_count := jsonb_array_length(COALESCE(prop.videos, '[]'::jsonb));
    amenity_count := jsonb_array_length(COALESCE(prop.amenities, '[]'::jsonb));
    description_length := LENGTH(COALESCE(prop.description, ''));
    
    SELECT COUNT(*) INTO doc_count 
    FROM property_documents 
    WHERE property_id = prop_id;
    
    -- Build breakdown
    breakdown := jsonb_build_object(
        'total_score', calculate_property_health_score(prop_id),
        'items', jsonb_build_object(
            'coordinates', jsonb_build_object(
                'points', CASE WHEN prop.coordinates IS NOT NULL THEN 10 ELSE 0 END,
                'max_points', 10,
                'completed', prop.coordinates IS NOT NULL
            ),
            'photos', jsonb_build_object(
                'points', CASE 
                    WHEN photo_count >= 15 THEN 20
                    WHEN photo_count >= 10 THEN 15
                    WHEN photo_count >= 5 THEN 10
                    WHEN photo_count >= 1 THEN 5
                    ELSE 0
                END,
                'max_points', 20,
                'current_count', photo_count,
                'target_count', 15,
                'completed', photo_count >= 15
            ),
            'video', jsonb_build_object(
                'points', CASE WHEN video_count > 0 THEN 20 ELSE 0 END,
                'max_points', 20,
                'completed', video_count > 0
            ),
            'virtual_tour', jsonb_build_object(
                'points', CASE WHEN prop.virtual_tour_url IS NOT NULL THEN 15 ELSE 0 END,
                'max_points', 15,
                'completed', prop.virtual_tour_url IS NOT NULL
            ),
            'description', jsonb_build_object(
                'points', CASE 
                    WHEN description_length >= 200 THEN 20
                    WHEN description_length >= 100 THEN 15
                    WHEN description_length >= 50 THEN 10
                    WHEN description_length >= 20 THEN 5
                    ELSE 0
                END,
                'max_points', 20,
                'current_length', description_length,
                'target_length', 200,
                'completed', description_length >= 200
            ),
            'documents', jsonb_build_object(
                'points', CASE WHEN doc_count > 0 THEN 10 ELSE 0 END,
                'max_points', 10,
                'completed', doc_count > 0
            ),
            'amenities', jsonb_build_object(
                'points', CASE 
                    WHEN amenity_count >= 5 THEN 5
                    WHEN amenity_count >= 3 THEN 3
                    WHEN amenity_count >= 1 THEN 1
                    ELSE 0
                END,
                'max_points', 5,
                'current_count', amenity_count,
                'target_count', 5,
                'completed', amenity_count >= 5
            )
        )
    );
    
    -- Add suggestions for improvements
    suggestions := ARRAY[]::TEXT[];
    
    IF prop.coordinates IS NULL THEN
        suggestions := array_append(suggestions, 'Agrega la ubicación GPS exacta para ganar 10 puntos');
    END IF;
    
    IF photo_count < 15 THEN
        suggestions := array_append(suggestions, format('Sube %s fotos más para alcanzar 15 y ganar puntos máximos', 15 - photo_count));
    END IF;
    
    IF video_count = 0 THEN
        suggestions := array_append(suggestions, 'Agrega un video de la propiedad para ganar 20 puntos');
    END IF;
    
    IF prop.virtual_tour_url IS NULL THEN
        suggestions := array_append(suggestions, 'Agrega un tour virtual 360° para ganar 15 puntos');
    END IF;
    
    IF description_length < 200 THEN
        suggestions := array_append(suggestions, format('Expande la descripción a 200+ caracteres para ganar puntos máximos (actual: %s)', description_length));
    END IF;
    
    IF doc_count = 0 THEN
        suggestions := array_append(suggestions, 'Sube documentos del propietario para ganar 10 puntos');
    END IF;
    
    IF amenity_count < 5 THEN
        suggestions := array_append(suggestions, format('Agrega %s amenidades más para ganar puntos máximos', 5 - amenity_count));
    END IF;
    
    breakdown := breakdown || jsonb_build_object('suggestions', to_jsonb(suggestions));
    
    RETURN breakdown;
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_property_shares_property_id ON property_shares(property_id);
CREATE INDEX IF NOT EXISTS idx_property_shares_shared_by ON property_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_property_shares_share_token ON property_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_property_shares_active ON property_shares(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_property_share_views_share_id ON property_share_views(share_id);
CREATE INDEX IF NOT EXISTS idx_property_share_views_viewed_at ON property_share_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_portals_property_id ON property_portals(property_id);
CREATE INDEX IF NOT EXISTS idx_property_portals_status ON property_portals(status);

CREATE INDEX IF NOT EXISTS idx_properties_health_score ON properties(health_score DESC);
CREATE INDEX IF NOT EXISTS idx_properties_shared_in_mls ON properties(shared_in_mls) WHERE shared_in_mls = true;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Property Shares
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares from their agency"
    ON property_shares FOR SELECT
    USING (
        shared_by IN (
            SELECT id FROM user_profiles 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
        OR shared_with = auth.uid()
    );

CREATE POLICY "Users can create shares for their agency properties"
    ON property_shares FOR INSERT
    WITH CHECK (
        shared_by = auth.uid()
        AND property_id IN (
            SELECT id FROM properties 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own shares"
    ON property_shares FOR UPDATE
    USING (shared_by = auth.uid());

CREATE POLICY "Users can delete their own shares"
    ON property_shares FOR DELETE
    USING (shared_by = auth.uid());

-- Property Share Views (Public read for analytics)
ALTER TABLE property_share_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create share views"
    ON property_share_views FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view analytics for their shares"
    ON property_share_views FOR SELECT
    USING (
        share_id IN (
            SELECT id FROM property_shares 
            WHERE shared_by IN (
                SELECT id FROM user_profiles 
                WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
            )
        )
    );

-- Property Portals
ALTER TABLE property_portals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view portal configs for their agency"
    ON property_portals FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage portal configs for their properties"
    ON property_portals FOR ALL
    USING (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        )
    );

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE property_shares IS 'Tracks property shares with different modalities (white label, MLS, original)';
COMMENT ON TABLE property_share_views IS 'Analytics for property share link views';
COMMENT ON TABLE property_portals IS 'Multi-portal publishing configuration and status';

COMMENT ON FUNCTION calculate_property_health_score IS 'Calculates property health score (0-100) based on completeness';
COMMENT ON FUNCTION get_property_health_score_breakdown IS 'Returns detailed breakdown and suggestions for improving health score';
