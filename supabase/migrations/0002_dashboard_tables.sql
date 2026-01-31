-- ============================================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLA: user_objectives (Objetivos mensuales por usuario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación multi-tenant
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Periodo
  period TEXT NOT NULL, -- 'YYYY-MM' ejemplo: '2025-01'
  
  -- Objetivo
  target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  percentage_achieved INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN target_amount > 0 THEN (current_amount * 100 / target_amount)::INTEGER
      ELSE 0
    END
  ) STORED,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint único por usuario y periodo
  UNIQUE(user_id, period)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_objectives_user ON user_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_user_objectives_agency ON user_objectives(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_objectives_period ON user_objectives(period);

-- ============================================================================
-- TABLA: broker_levels (Niveles de brokers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS broker_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del nivel
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL UNIQUE,
  
  -- Requisitos
  min_operations INTEGER NOT NULL DEFAULT 0,
  min_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Configuración visual
  color TEXT DEFAULT '#6B7280', -- Tailwind gray-500
  icon TEXT DEFAULT '⭐',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DATOS: Niveles de broker (5 niveles)
-- ============================================================================
INSERT INTO broker_levels (name, order_index, min_operations, min_revenue, color, icon) VALUES
  ('Broker Inicial', 1, 0, 0, '#9CA3AF', '🌱'),
  ('Broker Profesional', 2, 5, 1000000, '#3B82F6', '⭐'),
  ('Broker Elite', 3, 15, 5000000, '#8B5CF6', '💎'),
  ('Broker Master', 4, 30, 15000000, '#F59E0B', '👑'),
  ('Broker Legend', 5, 50, 30000000, '#EF4444', '🔥')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FUNCIÓN: Calcular nivel del broker
-- ============================================================================
DROP FUNCTION IF EXISTS calculate_user_level(UUID);
CREATE OR REPLACE FUNCTION calculate_user_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_total_operations INTEGER;
  v_total_revenue DECIMAL(15,2);
  v_level_name TEXT;
BEGIN
  -- Contar operaciones cerradas del último año
  SELECT 
    COUNT(*),
    COALESCE(SUM(sale_price), 0)
  INTO v_total_operations, v_total_revenue
  FROM operations
  WHERE producer_id = p_user_id
    AND status = 'completed'
    AND closing_date >= NOW() - INTERVAL '1 year';
  
  -- Determinar nivel basado en operaciones y revenue
  SELECT name INTO v_level_name
  FROM broker_levels
  WHERE min_operations <= v_total_operations
    AND min_revenue <= v_total_revenue
  ORDER BY order_index DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level_name, 'Broker Inicial');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Obtener resumen del dashboard
-- ============================================================================
DROP FUNCTION IF EXISTS get_dashboard_summary(UUID);
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user user_profiles%ROWTYPE;
  v_objective user_objectives%ROWTYPE;
  v_level TEXT;
  v_properties_count INTEGER;
  v_leads_count INTEGER;
  v_tasks_pending INTEGER;
  v_operations_month DECIMAL(15,2);
  v_current_period TEXT;
BEGIN
  -- Obtener usuario
  SELECT * INTO v_user FROM user_profiles WHERE id = p_user_id;
  
  -- Periodo actual
  v_current_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Obtener objetivo del mes actual
  SELECT * INTO v_objective
  FROM user_objectives
  WHERE user_id = p_user_id
    AND period = v_current_period;
  
  -- Si no existe objetivo, crear uno vacío
  IF NOT FOUND THEN
    INSERT INTO user_objectives (agency_id, user_id, period, target_amount)
    VALUES (v_user.agency_id, p_user_id, v_current_period, 1000000)
    RETURNING * INTO v_objective;
  END IF;
  
  -- Calcular nivel
  v_level := calculate_user_level(p_user_id);
  
  -- Contar propiedades activas
  SELECT COUNT(*) INTO v_properties_count
  FROM properties
  WHERE producer_id = p_user_id
    AND status IN ('disponible', 'apartado')
    AND deleted_at IS NULL;
  
  -- Contar leads nuevos (últimos 30 días)
  SELECT COUNT(*) INTO v_leads_count
  FROM contacts
  WHERE assigned_to = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL;
  
  -- Contar tareas pendientes
  SELECT COUNT(*) INTO v_tasks_pending
  FROM tasks
  WHERE assigned_to = p_user_id
    AND status = 'pending'
    AND (due_date IS NULL OR due_date >= NOW());
  
  -- Sumar operaciones del mes
  SELECT COALESCE(SUM(sale_price), 0) INTO v_operations_month
  FROM operations
  WHERE producer_id = p_user_id
    AND status = 'completed'
    AND closing_date >= DATE_TRUNC('month', NOW());
  
  -- Retornar JSON con todo el resumen
  RETURN json_build_object(
    'user', json_build_object(
      'id', v_user.id,
      'full_name', v_user.full_name,
      'email', v_user.email,
      'role', v_user.role
    ),
    'level', v_level,
    'objective', json_build_object(
      'period', v_objective.period,
      'target', v_objective.target_amount,
      'current', v_objective.current_amount,
      'percentage', v_objective.percentage_achieved
    ),
    'metrics', json_build_object(
      'properties_active', v_properties_count,
      'new_leads', v_leads_count,
      'tasks_pending', v_tasks_pending,
      'sales_this_month', v_operations_month
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_levels ENABLE ROW LEVEL SECURITY;

-- Usuarios ven solo sus objetivos
DROP POLICY IF EXISTS "users_view_own_objectives" ON user_objectives;
CREATE POLICY "users_view_own_objectives"
  ON user_objectives FOR SELECT
  USING (user_id = auth.uid());

-- Admins ven todos los objetivos de su agencia
DROP POLICY IF EXISTS "admins_view_all_agency_objectives" ON user_objectives;
CREATE POLICY "admins_view_all_agency_objectives"
  ON user_objectives FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'director')
  );

-- Usuarios pueden actualizar sus propios objetivos
DROP POLICY IF EXISTS "users_update_own_objectives" ON user_objectives;
CREATE POLICY "users_update_own_objectives"
  ON user_objectives FOR UPDATE
  USING (user_id = auth.uid());

-- Todos pueden ver los niveles de broker
DROP POLICY IF EXISTS "all_view_broker_levels" ON broker_levels;
CREATE POLICY "all_view_broker_levels"
  ON broker_levels FOR SELECT
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_user_objectives_updated_at ON user_objectives;
CREATE TRIGGER update_user_objectives_updated_at
  BEFORE UPDATE ON user_objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON user_objectives TO authenticated;
GRANT SELECT ON broker_levels TO authenticated;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE user_objectives IS 'Objetivos mensuales de cada usuario';
COMMENT ON TABLE broker_levels IS 'Niveles de broker (Inicial → Legend)';
COMMENT ON FUNCTION calculate_user_level IS 'Calcula el nivel actual del broker basado en sus operaciones';
COMMENT ON FUNCTION get_dashboard_summary IS 'Retorna resumen completo del dashboard para un usuario';

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
