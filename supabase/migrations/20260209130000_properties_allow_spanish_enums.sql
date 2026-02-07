-- Permitir valores en español en property_type y operation_type (además de los existentes en inglés)
-- para que el seed y el wizard puedan usar: venta, renta, ambos; casa, departamento, oficina, etc.

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_operation_type_check;

ALTER TABLE properties ADD CONSTRAINT properties_property_type_check CHECK (
  property_type IN (
    'house', 'apartment', 'condo', 'townhouse', 'land', 'commercial',
    'office', 'warehouse', 'building', 'farm', 'development',
    'casa', 'departamento', 'terreno', 'local', 'oficina', 'bodega', 'otro'
  )
);

ALTER TABLE properties ADD CONSTRAINT properties_operation_type_check CHECK (
  operation_type IN ('sale', 'rent', 'both', 'venta', 'renta', 'ambos')
);
