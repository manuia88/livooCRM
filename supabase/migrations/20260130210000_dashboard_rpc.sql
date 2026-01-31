-- ============================================================================

DROP FUNCTION IF EXISTS get_dashboard_summary(UUID);

CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_user_profile RECORD;
    v_active_properties INTEGER;
    v_pending_tasks INTEGER;
    v_closed_deals INTEGER;
BEGIN
    -- Obtener perfil (con manejo de nulos)
    SELECT first_name, avatar_url, role INTO v_user_profile 
    FROM user_profiles 
    WHERE id = p_user_id;
    
    -- Obtener métricas
    SELECT COUNT(*) INTO v_active_properties FROM properties WHERE producer_id = p_user_id AND status = 'disponible';
    SELECT COUNT(*) INTO v_pending_tasks FROM tasks WHERE assigned_to = p_user_id AND status = 'pendiente';
    SELECT COUNT(*) INTO v_closed_deals FROM properties WHERE producer_id = p_user_id AND status = 'vendida';

    v_result := jsonb_build_object(
        'user', jsonb_build_object(
            'name', COALESCE(v_user_profile.first_name, 'Usuario'),
            'avatar', COALESCE(v_user_profile.avatar_url, ''),
            'level', COALESCE(v_user_profile.role, 'Broker Profesional')
        ),
        'summary', jsonb_build_object(
            'user_level', COALESCE(v_user_profile.role, 'Broker Profesional'),
            'objective', jsonb_build_object(
                'target', 5000000,
                'current', 3750000,
                'percentage', 75,
                'period', 'Semestral'
            )
        ),
        'metrics', jsonb_build_object(
            'activeProperties', v_active_properties,
            'pendingTasks', v_pending_tasks,
            'closedDeals', v_closed_deals
        )
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
