-- ============================================================================
-- LIVOO CRM - DATABASE PERFORMANCE OPTIMIZATION (MATERIALIZED VIEWS)
-- Migration: 20260209140001_materialized_views.sql
-- Description: Dashboard metrics cache for sub-100ms loading
-- ============================================================================

-- Drop if exists to ensure clean creation
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics_cache;

-- Create Materialized View for Dashboard Metrics
CREATE MATERIALIZED VIEW dashboard_metrics_cache AS
SELECT 
  a.id as agency_id,
  
  -- Properties metrics
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active' AND p.deleted_at IS NULL) as properties_active,
  COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) as properties_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '30 days' AND p.deleted_at IS NULL) as properties_new_30d,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'sold' AND p.updated_at > NOW() - INTERVAL '30 days' AND p.deleted_at IS NULL) as properties_sold_30d,
  
  -- Contacts metrics
  COUNT(DISTINCT c.id) FILTER (WHERE c.lead_score >= 80 AND c.deleted_at IS NULL) as leads_hot,
  COUNT(DISTINCT c.id) FILTER (WHERE c.deleted_at IS NULL) as leads_count,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '30 days' AND c.deleted_at IS NULL) as leads_new_30d,
  
  -- Tasks metrics
  COUNT(DISTINCT t.id) FILTER (WHERE t.status NOT IN ('completed', 'cancelled', 'skipped')) as tasks_pending,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status NOT IN ('completed', 'cancelled', 'skipped') AND t.due_date < NOW()) as tasks_overdue,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed' AND t.updated_at > NOW() - INTERVAL '30 days') as tasks_completed_30d,
  
  -- Metadata
  NOW() as last_updated

FROM agencies a
LEFT JOIN properties p ON p.agency_id = a.id
LEFT JOIN contacts c ON c.agency_id = a.id
LEFT JOIN tasks t ON t.agency_id = a.id
WHERE a.deleted_at IS NULL
GROUP BY a.id;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_dashboard_metrics_agency_id ON dashboard_metrics_cache(agency_id);

-- Function to refresh metrics
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Perform concurrent refresh (requires the unique index)
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_cache;
END;
$$;

-- Note: In a production Supabase environment, you would schedule this function
-- using pg_cron or a Supabase Edge Function cron.
-- Example: SELECT cron.schedule('*/5 * * * *', 'SELECT refresh_dashboard_metrics()');
