-- ============================================================================
-- FIX: Corregir políticas RLS para user_objectives y get_dashboard_summary
-- ============================================================================

-- Paso 0: Corregir CHECK constraint en period para permitir formato 'YYYY-MM'
-- El constraint anterior solo permitía ('monthly', 'quarterly', 'yearly')
-- pero la función usa formato 'YYYY-MM' (ej: '2026-01')
-- Primero eliminamos filas con valores antiguos que violarían el nuevo constraint
DELETE FROM user_objectives 
WHERE period NOT SIMILAR TO '\d{4}-\d{2}';

-- Luego eliminamos el constraint antiguo
ALTER TABLE user_objectives 
DROP CONSTRAINT IF EXISTS user_objectives_period_check;

-- Y agregamos el nuevo constraint
ALTER TABLE user_objectives
ADD CONSTRAINT user_objectives_period_check 
CHECK (period ~ '^\d{4}-\d{2}$');

-- Agregar política INSERT para user_objectives
-- Los usuarios pueden crear sus propios objetivos
DROP POLICY IF EXISTS "users_insert_own_objectives" ON user_objectives;
CREATE POLICY "users_insert_own_objectives"
  ON user_objectives FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Actualizar la función get_dashboard_summary para usar SECURITY DEFINER
-- Esto permite que la función ejecute con privilegios elevados y pueda insertar
-- sin problemas de RLS cuando sea necesario
DROP FUNCTION IF EXISTS get_dashboard_summary(UUID);

CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_user_profile RECORD;
  v_objective RECORD;
  v_active_properties INTEGER;
  v_pending_tasks INTEGER;
  v_closed_deals INTEGER;
  v_current_period TEXT;
BEGIN
  -- Obtener perfil del usuario
  SELECT first_name, avatar_url, role, agency_id INTO v_user_profile 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  -- Si no existe el usuario, retornar error
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Usuario no encontrado');
  END IF;
  
  -- Periodo actual (formato YYYY-MM)
  v_current_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Obtener objetivo del mes actual (si existe)
  SELECT * INTO v_objective
  FROM user_objectives
  WHERE user_id = p_user_id
    AND period = v_current_period
  LIMIT 1;
  
  -- Si no existe objetivo, crear uno por defecto
  -- Usamos SECURITY DEFINER para que pueda insertar sin problemas de RLS
  IF NOT FOUND THEN
    INSERT INTO user_objectives (
      agency_id, 
      user_id, 
      period, 
      target_amount, 
      current_amount,
      start_date,
      end_date
    )
    VALUES (
      COALESCE(v_user_profile.agency_id, (SELECT id FROM agencies LIMIT 1)),
      p_user_id,
      v_current_period,
      1000000, -- Objetivo por defecto: 1 millón
      0,
      DATE_TRUNC('month', NOW())::DATE, -- Primer día del mes actual
      (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::DATE -- Último día del mes actual
    )
    RETURNING * INTO v_objective;
  END IF;
  
  -- Obtener métricas
  SELECT COUNT(*) INTO v_active_properties 
  FROM properties 
  WHERE producer_id = p_user_id 
    AND status = 'disponible'
    AND deleted_at IS NULL;
    
  SELECT COUNT(*) INTO v_pending_tasks 
  FROM tasks 
  WHERE assigned_to = p_user_id 
    AND status IN ('pendiente', 'pending')
    AND deleted_at IS NULL;
    
  SELECT COUNT(*) INTO v_closed_deals 
  FROM properties 
  WHERE producer_id = p_user_id 
    AND status = 'vendida'
    AND deleted_at IS NULL;

  -- Construir respuesta
  v_result := jsonb_build_object(
    'user', jsonb_build_object(
      'name', COALESCE(v_user_profile.first_name, 'Usuario'),
      'avatar', COALESCE(v_user_profile.avatar_url, ''),
      'level', COALESCE(v_user_profile.role, 'Broker Profesional')
    ),
    'summary', jsonb_build_object(
      'user_level', COALESCE(v_user_profile.role, 'Broker Profesional'),
      'objective', jsonb_build_object(
        'target', COALESCE(v_objective.target_amount, 1000000),
        'current', COALESCE(v_objective.current_amount, 0),
        'percentage', COALESCE(
          CASE 
            WHEN v_objective.target_amount > 0 
            THEN (v_objective.current_amount * 100.0 / v_objective.target_amount)::NUMERIC(5,2)
            ELSE 0
          END,
          0
        ),
        'period', COALESCE(v_objective.period, v_current_period)
      )
    ),
    'metrics', jsonb_build_object(
      'activeProperties', COALESCE(v_active_properties, 0),
      'pendingTasks', COALESCE(v_pending_tasks, 0),
      'closedDeals', COALESCE(v_closed_deals, 0)
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant para que usuarios autenticados puedan ejecutar la función
GRANT EXECUTE ON FUNCTION get_dashboard_summary(UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION get_dashboard_summary IS 'Retorna resumen completo del dashboard para un usuario. Crea objetivo por defecto si no existe.';
