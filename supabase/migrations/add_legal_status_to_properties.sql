-- =====================================================
-- Agregar campo legal_status a properties
-- =====================================================

-- Agregar columna legal_status si no existe
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS legal_status TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN properties.legal_status IS 'Estado del proceso legal de la propiedad: solicitud_docs, revision_legal, escrituras_proceso, liberacion_gravamenes, sin_contrato, en_revision, escrituras_tramite, escrituras_listas, liberacion_gravamen, contrato_firmado';
