-- ============================================================================
-- FIX: Corregir CHECK constraint en user_objectives.period
-- Problema: El constraint solo permite ('monthly', 'quarterly', 'yearly')
-- pero la función usa formato 'YYYY-MM' (ej: '2026-01')
-- Además, hay filas existentes con valores antiguos que violan el nuevo constraint
-- Solución: 
--   1. Eliminar o actualizar filas con valores antiguos
--   2. Cambiar el constraint para permitir formato 'YYYY-MM'
-- ============================================================================

-- Paso 1: Eliminar filas con valores antiguos ('monthly', 'quarterly', 'yearly')
-- o actualizarlas al formato correcto basado en sus fechas
-- Por seguridad, primero las eliminamos ya que la función creará nuevas automáticamente
DELETE FROM user_objectives 
WHERE period NOT SIMILAR TO '\d{4}-\d{2}';

-- Paso 2: Eliminar el constraint antiguo si existe
ALTER TABLE user_objectives 
DROP CONSTRAINT IF EXISTS user_objectives_period_check;

-- Paso 3: Agregar nuevo constraint que permite formato 'YYYY-MM' (ej: '2026-01', '2025-12')
ALTER TABLE user_objectives
ADD CONSTRAINT user_objectives_period_check 
CHECK (period ~ '^\d{4}-\d{2}$');

-- Comentario
COMMENT ON COLUMN user_objectives.period IS 'Periodo en formato YYYY-MM (ej: 2026-01 para enero 2026)';
