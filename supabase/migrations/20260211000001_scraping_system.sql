-- Web scraping system for importing properties from external portals
-- Supports: inmuebles24, vivanuncios, lamudi, properati

-- Scraped listings (pre-import staging)
CREATE TABLE IF NOT EXISTS scraped_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  source TEXT CHECK (source IN ('inmuebles24', 'vivanuncios', 'lamudi', 'properati')) NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  property_type TEXT,
  operation_type TEXT CHECK (operation_type IN ('venta', 'renta', 'traspaso')),
  price NUMERIC,
  currency TEXT DEFAULT 'MXN',
  bedrooms INTEGER,
  bathrooms NUMERIC,
  parking_spaces INTEGER,
  construction_m2 NUMERIC,
  land_m2 NUMERIC,
  address JSONB DEFAULT '{}',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '{}',
  raw_data JSONB DEFAULT '{}',
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  imported BOOLEAN DEFAULT FALSE,
  imported_at TIMESTAMPTZ,
  imported_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  duplicate_of UUID REFERENCES scraped_listings(id) ON DELETE SET NULL,
  UNIQUE(source, external_id)
);

-- Performance indexes
CREATE INDEX idx_scraped_source_date ON scraped_listings(source, scraped_at DESC);
CREATE INDEX idx_scraped_imported ON scraped_listings(imported, scraped_at DESC);
CREATE INDEX idx_scraped_agency ON scraped_listings(agency_id, scraped_at DESC);
CREATE INDEX idx_scraped_price ON scraped_listings(price) WHERE price IS NOT NULL;
CREATE INDEX idx_scraped_location ON scraped_listings(latitude, longitude) WHERE latitude IS NOT NULL;

-- Scraping job history
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  search_params JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
  pages_requested INTEGER DEFAULT 1,
  pages_scraped INTEGER DEFAULT 0,
  listings_found INTEGER DEFAULT 0,
  listings_new INTEGER DEFAULT 0,
  listings_updated INTEGER DEFAULT 0,
  listings_duplicates INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status, created_at DESC);
CREATE INDEX idx_scraping_jobs_agency ON scraping_jobs(agency_id, created_at DESC);

-- RLS
ALTER TABLE scraped_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scraped listings from their agency"
  ON scraped_listings
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage scraped listings from their agency"
  ON scraped_listings
  FOR ALL
  USING (
    agency_id IN (
      SELECT agency_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view scraping jobs from their agency"
  ON scraping_jobs
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage scraping jobs from their agency"
  ON scraping_jobs
  FOR ALL
  USING (
    agency_id IN (
      SELECT agency_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );
