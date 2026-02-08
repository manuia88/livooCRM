-- ============================================================================
-- LIVOO CRM - DATABASE PERFORMANCE OPTIMIZATION (FUNCTIONS)
-- Migration: 20260209140002_optimized_functions.sql
-- Description: High-performance functions for search and analytics
-- ============================================================================

-- Function 1: Advanced Property Search (Optimized)
CREATE OR REPLACE FUNCTION search_properties(
  p_agency_id UUID,
  p_search_text TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_operation_type TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_bedrooms INT DEFAULT NULL,
  p_bathrooms NUMERIC DEFAULT NULL,
  p_lat NUMERIC DEFAULT NULL,
  p_lng NUMERIC DEFAULT NULL,
  p_radius_meters INT DEFAULT 5000,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  sale_price NUMERIC,
  rent_price NUMERIC,
  bedrooms INT,
  bathrooms NUMERIC,
  construction_m2 NUMERIC,
  address JSONB,
  photos JSONB,
  status TEXT,
  distance_meters NUMERIC
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.sale_price,
    p.rent_price,
    p.bedrooms,
    p.bathrooms,
    p.construction_m2,
    p.address,
    p.photos,
    p.status,
    CASE 
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
        ST_Distance(
          p.coordinates::geography,
          ST_MakePoint(p_lng, p_lat)::geography
        )
      ELSE NULL
    END as distance_meters
  FROM properties p
  WHERE p.deleted_at IS NULL
    AND p.agency_id = p_agency_id
    -- Filtering
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
    AND (p_operation_type IS NULL OR p.operation_type = p_operation_type)
    AND (p_min_price IS NULL OR 
         (p.sale_price >= p_min_price OR p.rent_price >= p_min_price))
    AND (p_max_price IS NULL OR 
         (p.sale_price <= p_max_price OR p.rent_price <= p_max_price))
    AND (p_bedrooms IS NULL OR p.bedrooms >= p_bedrooms)
    AND (p_bathrooms IS NULL OR p.bathrooms >= p_bathrooms)
    -- Full-text search (GIN index used here)
    AND (p_search_text IS NULL OR 
         to_tsvector('spanish', 
           COALESCE(p.title, '') || ' ' || 
           COALESCE(p.description, '') || ' ' ||
           COALESCE(p.neighborhood, '') || ' ' ||
           COALESCE(p.city, '')
         ) @@ plainto_tsquery('spanish', p_search_text))
    -- Geographic search (GIST index used here)
    AND (p_lat IS NULL OR p_lng IS NULL OR
         ST_DWithin(
           p.coordinates::geography,
           ST_MakePoint(p_lng, p_lat)::geography,
           p_radius_meters
         ))
  ORDER BY 
    CASE WHEN p_lat IS NOT NULL THEN 1 ELSE 0 END DESC, -- Prioritize radial sort if coords provided
    CASE WHEN p_lat IS NOT NULL THEN ST_Distance(p.coordinates::geography, ST_MakePoint(p_lng, p_lat)::geography) END ASC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function 2: User Dashboard (Uses Materialized View)
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS TABLE (
  agency_id UUID,
  properties_active BIGINT,
  properties_count BIGINT,
  leads_hot BIGINT,
  leads_count BIGINT,
  tasks_pending BIGINT,
  tasks_overdue BIGINT,
  properties_trend NUMERIC,
  leads_trend NUMERIC,
  conversion_rate NUMERIC,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  -- Get user's agency_id
  SELECT up.agency_id INTO v_agency_id
  FROM user_profiles up
  WHERE up.id = p_user_id;
  
  IF v_agency_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    dmc.agency_id,
    dmc.properties_active,
    dmc.properties_count,
    dmc.leads_hot,
    dmc.leads_count,
    dmc.tasks_pending,
    dmc.tasks_overdue,
    
    -- Trends (new items in last 30d relative to total)
    CASE 
      WHEN dmc.properties_count > 0 THEN
        ROUND(((dmc.properties_new_30d::NUMERIC / dmc.properties_count) * 100), 1)
      ELSE 0
    END as properties_trend,
    
    CASE 
      WHEN dmc.leads_count > 0 THEN
        ROUND(((dmc.leads_new_30d::NUMERIC / dmc.leads_count) * 100), 1)
      ELSE 0
    END as leads_trend,
    
    -- Conversion (sold properties in last 30d relative to total)
    CASE 
      WHEN dmc.properties_count > 0 THEN
        ROUND(((dmc.properties_sold_30d::NUMERIC / dmc.properties_count) * 100), 1)
      ELSE 0
    END as conversion_rate,
    
    dmc.last_updated
    
  FROM dashboard_metrics_cache dmc
  WHERE dmc.agency_id = v_agency_id;
END;
$$;

-- Function 3: Fast Radius Search
CREATE OR REPLACE FUNCTION properties_within_radius(
  p_agency_id UUID,
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_meters INT DEFAULT 5000,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  sale_price NUMERIC,
  address JSONB,
  distance_meters NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id,
    p.title,
    p.sale_price,
    p.address,
    ST_Distance(
      p.coordinates::geography,
      ST_MakePoint(p_lng, p_lat)::geography
    ) as distance_meters
  FROM properties p
  WHERE p.deleted_at IS NULL
    AND p.agency_id = p_agency_id
    AND p.coordinates IS NOT NULL
    AND ST_DWithin(
      p.coordinates::geography,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT p_limit;
$$;
