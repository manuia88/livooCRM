-- Motivo de baja al dar de baja una propiedad (para reportes y auditoría)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
