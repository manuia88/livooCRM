-- Migration: 20260210000000_property_images
-- Description: Create property_images table for optimized storage

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Tabla para almacenar URLs de imágenes optimizadas
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  original_size_bytes BIGINT,
  
  -- URLs optimizadas
  thumbnail_url TEXT NOT NULL,
  medium_url TEXT NOT NULL,
  large_url TEXT NOT NULL,
  
  -- Metadata
  width INT,
  height INT,
  format TEXT DEFAULT 'webp', -- 'webp' siempre
  optimized_size_bytes BIGINT,
  compression_ratio NUMERIC, -- Ej: 0.25 = 75% reducción
  
  -- Control
  is_primary BOOLEAN DEFAULT FALSE, -- Primera imagen
  display_order INT DEFAULT 0,
  alt_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_images_property 
ON property_images(property_id, display_order);

CREATE INDEX IF NOT EXISTS idx_property_images_primary 
ON property_images(property_id, is_primary) 
WHERE is_primary = TRUE;

-- RLS
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Helper to get agency_id if not present in auth.jwt()
-- In this project, it seems it uses auth.get_user_agency_id()

CREATE POLICY "Users can view images of their agency properties"
ON property_images FOR SELECT
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE agency_id = auth.user_agency_id()
  )
);

CREATE POLICY "Users can insert images for their agency properties"
ON property_images FOR INSERT
WITH CHECK (
  property_id IN (
    SELECT id FROM properties 
    WHERE agency_id = auth.user_agency_id()
  )
);

CREATE POLICY "Users can update images of their agency properties"
ON property_images FOR UPDATE
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE agency_id = auth.user_agency_id()
  )
);

CREATE POLICY "Users can delete images of their agency properties"
ON property_images FOR DELETE
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE agency_id = auth.user_agency_id()
  )
);

-- Policy for upload (authenticated users)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy para ver imágenes (público)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Policy para eliminar (solo owner)
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid() = owner
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_property_images_updated_at ON property_images;
CREATE TRIGGER update_property_images_updated_at
BEFORE UPDATE ON property_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para mantener solo 1 is_primary por propiedad
CREATE OR REPLACE FUNCTION enforce_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE property_images
    SET is_primary = FALSE
    WHERE property_id = NEW.property_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_primary_image_trigger ON property_images;
CREATE TRIGGER enforce_single_primary_image_trigger
BEFORE INSERT OR UPDATE ON property_images
FOR EACH ROW
EXECUTE FUNCTION enforce_single_primary_image();
