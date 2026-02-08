-- Caché de geocoding para evitar requests repetidas
CREATE TABLE IF NOT EXISTS geocoding_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL, -- query limpia (lowercase, sin espacios extra)
  result JSONB NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  use_count INT DEFAULT 1
);

-- Índice para búsqueda rápida
CREATE UNIQUE INDEX IF NOT EXISTS idx_geocoding_cache_normalized 
ON geocoding_cache(normalized_query);

-- Índice para limpiar caché antigua
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_last_used 
ON geocoding_cache(last_used_at DESC);

-- RLS (todos pueden leer caché, solo sistema puede escribir)
ALTER TABLE geocoding_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read geocoding cache'
    ) THEN
        CREATE POLICY "Anyone can read geocoding cache"
        ON geocoding_cache FOR SELECT
        USING (true);
    END IF;
END
$$;

-- Función para limpiar caché > 6 meses sin uso
CREATE OR REPLACE FUNCTION cleanup_old_geocoding_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM geocoding_cache
  WHERE last_used_at < NOW() - INTERVAL '6 months';
END;
$$;
