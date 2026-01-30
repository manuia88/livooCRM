-- =============================================
-- NEXUS OS - Analytics & Reports Module
-- Migration: 0017_analytics_views_reports
-- Description: Analytics views, sales funnel metrics, agent performance, and report generation
-- =============================================

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Sales Funnel View
CREATE OR REPLACE VIEW v_sales_funnel AS
SELECT 
    c.agency_id,
    c.status,
    COUNT(*) as contact_count,
    ROUND(AVG(c.lead_score)::NUMERIC, 2) as avg_lead_score,
    COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days') as new_this_month,
    COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days') as new_this_week,
    SUM(COALESCE(c.budget_max, 0)) as total_pipeline_value,
    ROUND(AVG(COALESCE(c.budget_max, 0))::NUMERIC, 2) as avg_deal_value
FROM contacts c
WHERE c.deleted_at IS NULL
GROUP BY c.agency_id, c.status;

-- Sales Funnel with Conversion Rates
CREATE OR REPLACE VIEW v_sales_funnel_conversion AS
WITH funnel_stages AS (
    SELECT 
        agency_id,
        status,
        COUNT(*) as count
    FROM contacts
    WHERE deleted_at IS NULL
    GROUP BY agency_id, status
),
stage_order AS (
    SELECT 
        agency_id,
        status,
        count,
        CASE status
            WHEN 'new' THEN 1
            WHEN 'contacted' THEN 2
            WHEN 'qualified' THEN 3
            WHEN 'visiting' THEN 4
            WHEN 'negotiating' THEN 5
            WHEN 'closed_won' THEN 6
            WHEN 'closed_lost' THEN 7
            WHEN 'inactive' THEN 8
        END as stage_num
    FROM funnel_stages
)
SELECT 
    s1.agency_id,
    s1.status,
    s1.count,
    s2.count as next_stage_count,
    ROUND(
        CASE 
            WHEN s2.count IS NULL OR s1.count = 0 THEN 0
            ELSE (s2.count::NUMERIC / s1.count::NUMERIC * 100)
        END, 
        2
    ) as conversion_rate
FROM stage_order s1
LEFT JOIN stage_order s2 
    ON s1.agency_id = s2.agency_id 
    AND s2.stage_num = s1.stage_num + 1
ORDER BY s1.agency_id, s1.stage_num;

-- Agent Performance View
CREATE OR REPLACE VIEW v_agent_performance AS
SELECT 
    up.id as agent_id,
    up.full_name as agent_name,
    up.agency_id,
    up.avatar_url,
    up.role,
    
    -- Tasks Metrics
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
    COUNT(DISTINCT t.id) FILTER (
        WHERE t.status = 'completed' 
        AND t.completed_at IS NOT NULL 
        AND t.due_date IS NOT NULL
        AND t.completed_at <= t.due_date
    ) as tasks_on_time,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('pending', 'in_progress')) as tasks_pending,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') = 0 THEN 0
            ELSE (
                COUNT(DISTINCT t.id) FILTER (
                    WHERE t.status = 'completed' 
                    AND t.completed_at <= t.due_date
                )::NUMERIC / 
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::NUMERIC * 100
            )
        END, 
        2
    ) as task_completion_rate,
    
    -- Properties Metrics
    COUNT(DISTINCT p.id) as properties_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as properties_active,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status IN ('sold', 'rented')) as properties_closed,
    ROUND(AVG(p.health_score)::NUMERIC, 2) as avg_health_score,
    
    -- Contacts/Leads Metrics
    COUNT(DISTINCT c.id) as contacts_count,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'new') as contacts_new,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'qualified') as contacts_qualified,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'closed_won') as deals_won,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'closed_lost') as deals_lost,
    ROUND(AVG(c.lead_score)::NUMERIC, 2) as avg_lead_score,
    
    -- Visits Metrics
    COUNT(DISTINCT v.id) as visits_count,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'scheduled') as visits_scheduled,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'completed') as visits_completed,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'cancelled') as visits_cancelled,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT v.id) = 0 THEN 0
            ELSE (
                COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'completed')::NUMERIC /
                COUNT(DISTINCT v.id)::NUMERIC * 100
            )
        END,
        2
    ) as visit_completion_rate,
    
    -- Conversations Metrics
    COUNT(DISTINCT conv.id) as conversations_count,
    COUNT(DISTINCT conv.id) FILTER (WHERE conv.status = 'open') as conversations_open,
    AVG(
        EXTRACT(EPOCH FROM (m.created_at - conv.created_at)) / 60
    ) FILTER (
        WHERE m.direction = 'outbound' 
        AND m.created_at = (
            SELECT MIN(created_at) 
            FROM messages 
            WHERE conversation_id = conv.id 
            AND direction = 'outbound'
        )
    ) as avg_response_time_minutes
    
FROM user_profiles up
LEFT JOIN tasks t ON t.assigned_to = up.id AND t.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN properties p ON p.producer_id = up.id
LEFT JOIN contacts c ON c.assigned_to = up.id
LEFT JOIN visits v ON v.agent_id = up.id AND v.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN conversations conv ON conv.assigned_to = up.id AND conv.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN messages m ON m.conversation_id = conv.id
WHERE up.role IN ('agent', 'manager')
GROUP BY up.id, up.full_name, up.agency_id, up.avatar_url, up.role;

-- Revenue Metrics View
CREATE OR REPLACE VIEW v_revenue_metrics AS
SELECT 
    p.agency_id,
    DATE_TRUNC('month', COALESCE(p.updated_at, p.created_at)) as month,
    DATE_TRUNC('week', COALESCE(p.updated_at, p.created_at)) as week,
    
    -- Deal Counts
    COUNT(*) FILTER (WHERE p.status = 'sold') as properties_sold,
    COUNT(*) FILTER (WHERE p.status = 'rented') as properties_rented,
    COUNT(*) FILTER (WHERE p.status IN ('sold', 'rented')) as total_closed_deals,
    
    -- Revenue (Sales)
    SUM(p.sale_price) FILTER (WHERE p.status = 'sold') as total_sales_revenue,
    AVG(p.sale_price) FILTER (WHERE p.status = 'sold') as avg_sale_price,
    MIN(p.sale_price) FILTER (WHERE p.status = 'sold') as min_sale_price,
    MAX(p.sale_price) FILTER (WHERE p.status = 'sold') as max_sale_price,
    
    -- Revenue (Rentals) - Annualized
    SUM(p.rent_price * 10) FILTER (WHERE p.status = 'rented') as total_rental_value,
    AVG(p.rent_price) FILTER (WHERE p.status = 'rented') as avg_rent_price,
    
    -- Commissions (if tracked)
    SUM(p.commission_amount) FILTER (WHERE p.status IN ('sold', 'rented') AND p.commission_amount IS NOT NULL) as total_commissions,
    AVG(p.commission_amount) FILTER (WHERE p.status IN ('sold', 'rented') AND p.commission_amount IS NOT NULL) as avg_commission
    
FROM properties p
WHERE p.deleted_at IS NULL
GROUP BY p.agency_id, month, week;

-- Property Analytics View
CREATE OR REPLACE VIEW v_property_analytics AS
SELECT 
    p.id as property_id,
    p.agency_id,
    p.title,
    p.property_type,
    p.operation_type,
    p.status,
    p.health_score,
    
    -- Location
    p.city,
    p.state,
    p.neighborhood,
    
    -- Pricing
    COALESCE(p.sale_price, p.rent_price) as price,
    p.currency,
    
    -- Engagement Metrics
    p.views_count,
    p.favorites_count,
    p.inquiries_count,
    
    -- MLS Metrics
    p.shared_in_mls,
    p.share_count,
    
    -- Days on Market
    EXTRACT(DAY FROM (COALESCE(p.updated_at, NOW()) - p.created_at))::INTEGER as days_on_market,
    
    -- Producer/Seller
    prod.full_name as producer_name,
    sell.full_name as seller_name,
    
    -- Timestamps
    p.created_at,
    p.published_at,
    p.updated_at
    
FROM properties p
LEFT JOIN user_profiles prod ON p.producer_id = prod.id
LEFT JOIN user_profiles sell ON p.seller_id = sell.id
WHERE p.deleted_at IS NULL;

-- Activity Log Summary View
CREATE OR REPLACE VIEW v_activity_summary AS
SELECT 
    al.agency_id,
    al.user_id,
    up.full_name as user_name,
    al.entity_type,
    al.action,
    COUNT(*) as action_count,
    MAX(al.created_at) as last_action_at
FROM activity_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
WHERE al.created_at >= NOW() - INTERVAL '30 days'
GROUP BY al.agency_id, al.user_id, up.full_name, al.entity_type, al.action;

-- =============================================
-- REPORT GENERATION TABLES
-- =============================================

-- Saved Reports Configuration
CREATE TABLE IF NOT EXISTS saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    created_by UUID REFERENCES user_profiles(id) NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    report_type TEXT NOT NULL CHECK (report_type IN (
        'operations', 'commissions', 'inventory', 'agent_performance',
        'lead_sources', 'property_views', 'sales_funnel', 'custom'
    )),
    
    -- Report Configuration
    config JSONB DEFAULT '{}',
    -- Example: {"date_from": "2024-01-01", "date_to": "2024-12-31", "filters": {...}}
    
    -- Scheduling
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    schedule_day INTEGER, -- Day of week (1-7) or day of month (1-31)
    schedule_time TIME,
    last_generated_at TIMESTAMPTZ,
    next_generation_at TIMESTAMPTZ,
    
    -- Output
    output_format TEXT DEFAULT 'excel' CHECK (output_format IN ('excel', 'pdf', 'csv', 'json')),
    email_recipients JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Reports History
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_report_id UUID REFERENCES saved_reports(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    generated_by UUID REFERENCES user_profiles(id),
    
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    
    -- Date Range
    date_from DATE,
    date_to DATE,
    
    -- File Info
    file_url TEXT,
    file_size INTEGER,
    file_format TEXT,
    
    -- Metadata
    row_count INTEGER,
    generation_time_ms INTEGER,
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- Get Sales Funnel Conversion Rate
CREATE OR REPLACE FUNCTION get_funnel_conversion_rate(
    p_agency_id UUID,
    p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    from_status TEXT,
    to_status TEXT,
    count BIGINT,
    conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH status_changes AS (
        SELECT 
            agency_id,
            related_contact_id as contact_id,
            (metadata->>'old_status')::TEXT as old_status,
            (metadata->>'new_status')::TEXT as new_status,
            created_at
        FROM activity_logs
        WHERE agency_id = p_agency_id
        AND entity_type = 'contact'
        AND action = 'updated'
        AND metadata ? 'old_status'
        AND metadata ? 'new_status'
        AND created_at BETWEEN p_date_from AND p_date_to
    ),
    transition_counts AS (
        SELECT 
            old_status as from_status,
            new_status as to_status,
            COUNT(*) as transition_count
        FROM status_changes
        GROUP BY old_status, new_status
    ),
    status_totals AS (
        SELECT 
            old_status as status,
            COUNT(*) as total_count
        FROM status_changes
        GROUP BY old_status
    )
    SELECT 
        tc.from_status::TEXT,
        tc.to_status::TEXT,
        tc.transition_count,
        ROUND((tc.transition_count::NUMERIC / st.total_count::NUMERIC * 100)::NUMERIC, 2) as rate
    FROM transition_counts tc
    JOIN status_totals st ON tc.from_status = st.status
    ORDER BY tc.from_status, tc.transition_count DESC;
END;
$$;

-- Get Agent Leaderboard
CREATE OR REPLACE FUNCTION get_agent_leaderboard(
    p_agency_id UUID,
    p_metric TEXT DEFAULT 'deals_won', -- 'deals_won', 'tasks_completed', 'avg_health_score'
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    rank INTEGER,
    agent_id UUID,
    agent_name TEXT,
    metric_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_metric = 'deals_won' THEN
        RETURN QUERY
        SELECT 
            ROW_NUMBER() OVER (ORDER BY vap.deals_won DESC)::INTEGER as rank,
            vap.agent_id,
            vap.agent_name,
            vap.deals_won::NUMERIC as metric_value
        FROM v_agent_performance vap
        WHERE vap.agency_id = p_agency_id
        ORDER BY vap.deals_won DESC
        LIMIT p_limit;
        
    ELSIF p_metric = 'tasks_completed' THEN
        RETURN QUERY
        SELECT 
            ROW_NUMBER() OVER (ORDER BY vap.tasks_completed DESC)::INTEGER as rank,
            vap.agent_id,
            vap.agent_name,
            vap.tasks_completed::NUMERIC as metric_value
        FROM v_agent_performance vap
        WHERE vap.agency_id = p_agency_id
        ORDER BY vap.tasks_completed DESC
        LIMIT p_limit;
        
    ELSIF p_metric = 'avg_health_score' THEN
        RETURN QUERY
        SELECT 
            ROW_NUMBER() OVER (ORDER BY vap.avg_health_score DESC NULLS LAST)::INTEGER as rank,
            vap.agent_id,
            vap.agent_name,
            COALESCE(vap.avg_health_score, 0) as metric_value
        FROM v_agent_performance vap
        WHERE vap.agency_id = p_agency_id
        ORDER BY vap.avg_health_score DESC NULLS LAST
        LIMIT p_limit;
    END IF;
END;
$$;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_agency_user ON activity_logs(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, action);

CREATE INDEX IF NOT EXISTS idx_saved_reports_agency_id ON saved_reports(agency_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_scheduled ON saved_reports(is_scheduled, next_generation_at) WHERE is_scheduled = true;

CREATE INDEX IF NOT EXISTS idx_generated_reports_agency_id ON generated_reports(agency_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_expires_at ON generated_reports(expires_at);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Saved Reports
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports from their agency"
    ON saved_reports FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create reports for their agency"
    ON saved_reports FOR INSERT
    WITH CHECK (
        agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their agency reports"
    ON saved_reports FOR UPDATE
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their agency reports"
    ON saved_reports FOR DELETE
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

-- Generated Reports
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generated reports from their agency"
    ON generated_reports FOR SELECT
    USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Service role can insert generated reports"
    ON generated_reports FOR INSERT
    WITH CHECK (true);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON VIEW v_sales_funnel IS 'Sales funnel metrics by status with pipeline value';
COMMENT ON VIEW v_sales_funnel_conversion IS 'Sales funnel with conversion rates between stages';
COMMENT ON VIEW v_agent_performance IS 'Comprehensive agent performance metrics across all modules';
COMMENT ON VIEW v_revenue_metrics IS 'Revenue and commission metrics by month/week';
COMMENT ON VIEW v_property_analytics IS 'Property-level analytics with engagement metrics';
COMMENT ON VIEW v_activity_summary IS 'Summary of user activities in the last 30 days';

COMMENT ON FUNCTION get_funnel_conversion_rate IS 'Calculate conversion rates between funnel stages';
COMMENT ON FUNCTION get_agent_leaderboard IS 'Get top agents ranked by specified metric';
