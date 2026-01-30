-- ============================================================================
-- NEXUS OS - ADD HEALTH SCORE TO PROPERTIES
-- Migration: 0013_add_health_score_to_properties.sql
-- Purpose: Add health_score column and calculation functions
-- ============================================================================

-- ============================================================================
-- ADD HEALTH_SCORE COLUMN
-- ============================================================================
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100);

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS health_score_details JSONB DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN properties.health_score IS 
'Score de 0-100 que indica la calidad del listing. 
Calculado basado en: GPS (10), fotos (20), video (20), tour 360° (15), 
descripción (20), docs propietario (10), amenidades (5)';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_properties_health_score 
ON properties(health_score) 
WHERE health_score < 60 AND deleted_at IS NULL;

-- ============================================================================
-- FUNCIÓN: Calcular Health Score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_property_health_score(p_property_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_property RECORD;
  v_details JSONB := '{}';
  v_photos_count INTEGER;
  v_desc_length INTEGER;
  v_amenities_count INTEGER;
BEGIN
  SELECT * INTO v_property FROM properties WHERE id = p_property_id;
  
  -- GPS exacto (+10 pts)
  IF v_property.location IS NOT NULL THEN
    v_score := v_score + 10;
    v_details := v_details || '{"gps": true}';
  ELSE
    v_details := v_details || '{"gps": false, "gps_suggestion": "Agregar ubicación GPS exacta"}';
  END IF;
  
  -- Fotos (+20 pts si >= 15 fotos)
  v_photos_count := COALESCE(jsonb_array_length(v_property.photos), 0);
  IF v_photos_count >= 15 THEN
    v_score := v_score + 20;
    v_details := v_details || '{"photos": true}';
  ELSIF v_photos_count >= 5 THEN
    v_score := v_score + 10;
    v_details := v_details || jsonb_build_object(
      'photos', 'partial',
      'photos_suggestion', format('Agregar %s fotos más (tienes %s)', 15 - v_photos_count, v_photos_count)
    );
  ELSE
    v_details := v_details || jsonb_build_object(
      'photos', 'missing',
      'photos_suggestion', format('Agregar al menos 15 fotos profesionales (tienes %s)', v_photos_count)
    );
  END IF;
  
  -- Video (+20 pts)
  IF v_property.video_url IS NOT NULL THEN
    v_score := v_score + 20;
    v_details := v_details || '{"video": true}';
  ELSE
    v_details := v_details || '{"video": false, "video_suggestion": "Agregar video de la propiedad"}';
  END IF;
  
  -- Tour 360° (+15 pts)
  IF v_property.virtual_tour_url IS NOT NULL THEN
    v_score := v_score + 15;
    v_details := v_details || '{"virtual_tour": true}';
  ELSE
    v_details := v_details || '{"virtual_tour": false, "tour_suggestion": "Agregar tour virtual 360°"}';
  END IF;
  
  -- Descripción completa (+20 pts si >200 caracteres)
  v_desc_length := COALESCE(LENGTH(v_property.description), 0);
  IF v_desc_length >= 200 THEN
    v_score := v_score + 20;
    v_details := v_details || '{"description": true}';
  ELSIF v_desc_length >= 100 THEN
    v_score := v_score + 10;
    v_details := v_details || jsonb_build_object(
      'description', 'partial',
      'description_suggestion', format('Extender descripción (%s caracteres, mínimo 200)', v_desc_length)
    );
  ELSE
    v_details := v_details || jsonb_build_object(
      'description', 'missing',
      'description_suggestion', format('Descripción muy corta (%s caracteres, mínimo 200)', v_desc_length)
    );
  END IF;
  
  -- Documentos del propietario (+10 pts)
  IF v_property.owner_id IS NOT NULL THEN
    v_score := v_score + 10;
    v_details := v_details || '{"owner_docs": true}';
  ELSE
    v_details := v_details || '{"owner_docs": false, "docs_suggestion": "Agregar documentos del propietario"}';
  END IF;
  
  -- Amenidades (+5 pts si >= 3)
  v_amenities_count := COALESCE(jsonb_array_length(v_property.amenities), 0);
  IF v_amenities_count >= 3 THEN
    v_score := v_score + 5;
    v_details := v_details || '{"amenities": true}';
  ELSE
    v_details := v_details || jsonb_build_object(
      'amenities', 'missing',
      'amenities_suggestion', format('Agregar amenidades (tienes %s, mínimo 3)', v_amenities_count)
    );
  END IF;
  
  -- Actualizar en la BD
  UPDATE properties 
  SET 
    health_score = v_score,
    health_score_details = v_details,
    updated_at = NOW()
  WHERE id = p_property_id;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Calcular health score al crear/actualizar
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_calculate_health_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular health score automáticamente
  PERFORM calculate_property_health_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_property_health_score ON properties;

CREATE TRIGGER trigger_property_health_score
  AFTER INSERT OR UPDATE OF 
    location, photos, video_url, virtual_tour_url, description, owner_id, amenities
  ON properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_health_score();

-- ============================================================================
-- CALCULAR HEALTH SCORE PARA PROPIEDADES EXISTENTES
-- ============================================================================
DO $$
DECLARE
  prop RECORD;
  calculated_count INTEGER := 0;
BEGIN
  -- Calcular para todas las propiedades existentes
  FOR prop IN 
    SELECT id FROM properties WHERE deleted_at IS NULL
  LOOP
    PERFORM calculate_property_health_score(prop.id);
    calculated_count := calculated_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Health score calculado para % propiedades', calculated_count;
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION calculate_property_health_score TO authenticated;

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
