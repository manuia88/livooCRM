-- ============================================================================
-- LIVOO CRM - DATABASE PERFORMANCE OPTIMIZATION (INDEXES)
-- Migration: 20260209140000_create_indexes.sql
-- Description: Optimized indexes for high-scale performance
-- ============================================================================

-- PROPERTIES INDEXES
-- ============================================================================

-- Composite index for most common filters
-- Optimized for: agency_id = 'xxx' AND status = 'active' AND property_type = 'casa'
CREATE INDEX IF NOT EXISTS idx_properties_agency_status_type 
ON properties(agency_id, status, property_type) 
WHERE deleted_at IS NULL;

-- Temporal index for sorting by creation date
-- Optimized for: agency_id = 'xxx' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_agency_created_at 
ON properties(agency_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- Index for sale price ranges
CREATE INDEX IF NOT EXISTS idx_properties_agency_sale_price 
ON properties(agency_id, sale_price) 
WHERE sale_price IS NOT NULL AND deleted_at IS NULL;

-- Index for rent price ranges
CREATE INDEX IF NOT EXISTS idx_properties_agency_rent_price 
ON properties(agency_id, rent_price) 
WHERE rent_price IS NOT NULL AND deleted_at IS NULL;

-- Index for bedroom filters
CREATE INDEX IF NOT EXISTS idx_properties_agency_bedrooms 
ON properties(agency_id, bedrooms) 
WHERE bedrooms IS NOT NULL AND deleted_at IS NULL;

-- GIST spatial index for PostGIS searches (if not already exists)
-- This is critical for ST_DWithin queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates_gist_spatial 
ON properties USING GIST(coordinates);

-- GIN full-text search index (Spanish)
-- Includes title, description and key address components
CREATE INDEX IF NOT EXISTS idx_properties_fulltext_search_gin 
ON properties USING GIN(
  to_tsvector('spanish', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(neighborhood, '') || ' ' ||
    COALESCE(city, '')
  )
);

-- Indexes for ownership and assignments
CREATE INDEX IF NOT EXISTS idx_properties_agency_producer 
ON properties(agency_id, producer_id);

CREATE INDEX IF NOT EXISTS idx_properties_agency_seller 
ON properties(agency_id, seller_id);

-- CONTACTS INDEXES
-- ============================================================================

-- Composite index for stage/status filtering
-- Note: schema uses 'status' as the classification field
CREATE INDEX IF NOT EXISTS idx_contacts_agency_status_comp 
ON contacts(agency_id, status) 
WHERE status IS NOT NULL AND deleted_at IS NULL;

-- Lead scoring index for prioritization
CREATE INDEX IF NOT EXISTS idx_contacts_agency_lead_score_desc 
ON contacts(agency_id, lead_score DESC) 
WHERE deleted_at IS NULL;

-- Unique/searchable fields (with agency scoping)
CREATE INDEX IF NOT EXISTS idx_contacts_agency_email 
ON contacts(agency_id, email) 
WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_agency_phone 
ON contacts(agency_id, phone) 
WHERE phone IS NOT NULL AND deleted_at IS NULL;

-- Assignment index
CREATE INDEX IF NOT EXISTS idx_contacts_agency_assigned 
ON contacts(agency_id, assigned_to) 
WHERE deleted_at IS NULL;

-- GIN full-text search for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_search_names_gin 
ON contacts USING GIN(
  to_tsvector('spanish', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '')
  )
);

-- TASKS INDEXES
-- ============================================================================

-- Composite index for pending tasks by agency
CREATE INDEX IF NOT EXISTS idx_tasks_agency_status_due_date 
ON tasks(agency_id, status, due_date) 
WHERE status NOT IN ('completed', 'cancelled', 'skipped');

-- User-specific task lists
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status_due 
ON tasks(assigned_to, status, due_date) 
WHERE assigned_to IS NOT NULL;

-- Overdue tasks detection
CREATE INDEX IF NOT EXISTS idx_tasks_agency_overdue_check 
ON tasks(agency_id, due_date) 
WHERE status NOT IN ('completed', 'cancelled', 'skipped') AND due_date < NOW();

-- INTERACTIONS & VIEWS
-- ============================================================================

-- Timeline views for contacts
CREATE INDEX IF NOT EXISTS idx_interactions_contact_timeline 
ON contact_interactions(contact_id, interaction_at DESC);

-- Analytics per property and user
CREATE INDEX IF NOT EXISTS idx_property_views_analytics_prop 
ON property_views(property_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_views_analytics_user 
ON property_views(user_id, viewed_at DESC);
