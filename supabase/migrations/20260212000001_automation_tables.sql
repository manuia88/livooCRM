-- =============================================
-- LIVOO CRM - Phase 7: Automation Tables for n8n
-- Migration: 20260212000001_automation_tables
-- Description: Workflows, executions, and metrics tables
--              for n8n integration and automation tracking
-- =============================================

-- 1. Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  n8n_workflow_id TEXT UNIQUE,
  webhook_id TEXT,
  category TEXT CHECK (category IN ('property', 'lead', 'task', 'communication')) NOT NULL,
  active BOOLEAN DEFAULT false,
  template_data JSONB,
  config JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Automation Executions
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  n8n_execution_id TEXT,
  status TEXT CHECK (status IN ('success', 'error', 'running', 'waiting')) DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  input_data JSONB,
  output_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Automation Metrics (daily aggregation)
CREATE TABLE IF NOT EXISTS automation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_active ON automation_workflows(active);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON automation_workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_agency ON automation_workflows(agency_id);
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_started ON automation_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_workflow_date ON automation_metrics(workflow_id, date DESC);

-- RLS
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view workflows from their agency"
  ON automation_workflows FOR SELECT
  USING (agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins create workflows in their agency"
  ON automation_workflows FOR INSERT
  WITH CHECK (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Admins update workflows in their agency"
  ON automation_workflows FOR UPDATE
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Admins delete workflows in their agency"
  ON automation_workflows FOR DELETE
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Users view executions from their agency"
  ON automation_executions FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows
      WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users view metrics from their agency"
  ON automation_metrics FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows
      WHERE agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Auto-update metrics on execution completion
CREATE OR REPLACE FUNCTION update_automation_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO automation_metrics (workflow_id, date, total_executions, successful_executions, failed_executions, avg_duration_ms)
  VALUES (
    NEW.workflow_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
    COALESCE(NEW.duration_ms, 0)
  )
  ON CONFLICT (workflow_id, date)
  DO UPDATE SET
    total_executions = automation_metrics.total_executions + 1,
    successful_executions = automation_metrics.successful_executions + CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    failed_executions = automation_metrics.failed_executions + CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
    avg_duration_ms = (
      (automation_metrics.avg_duration_ms * automation_metrics.total_executions + COALESCE(NEW.duration_ms, 0))
      / (automation_metrics.total_executions + 1)
    ),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_execution_complete
  AFTER INSERT OR UPDATE OF status ON automation_executions
  FOR EACH ROW WHEN (NEW.status IN ('success', 'error'))
  EXECUTE FUNCTION update_automation_metrics();

-- Updated_at triggers
CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_metrics_updated_at
  BEFORE UPDATE ON automation_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE automation_workflows IS 'n8n workflow configuration and mapping';
COMMENT ON TABLE automation_executions IS 'Execution history for all automation workflows';
COMMENT ON TABLE automation_metrics IS 'Daily aggregated metrics per workflow';
