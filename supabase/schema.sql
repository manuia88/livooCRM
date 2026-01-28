-- Enable PostGIS for location features (optional, but good for real estate)
create extension if not exists postgis;

-- 1. AGENTS Table
create table agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_url text,
  whatsapp text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROPERTIES Table
create table properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'MXN' check (currency in ('MXN', 'USD')),
  type text not null, -- apartment, house, etc.
  listing_type text not null, -- rent, buy
  
  -- Location (Simplified for now, could use PostGIS geography column)
  address text,
  city text,
  state text,
  zip text,
  colonia text,
  lat double precision,
  lng double precision,
  
  is_featured boolean default false,
  agent_id uuid references agents(id) on delete set null,
  images text[], -- Array of URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FEATURES Table (One-to-One with Properties)
create table property_features (
  property_id uuid references properties(id) on delete cascade primary key,
  bedrooms int default 0,
  bathrooms numeric default 1,
  parking int default 0,
  area_m2 numeric not null,
  has_pool boolean default false,
  has_gym boolean default false,
  has_security boolean default false,
  pet_friendly boolean default false,
  furnished boolean default false
);

-- Row Level Security (RLS)
alter table agents enable row level security;
alter table properties enable row level security;
alter table property_features enable row level security;

-- Policies: Public Read Access
create policy "Public agents are viewable by everyone." on agents for select using (true);
create policy "Public properties are viewable by everyone." on properties for select using (true);
create policy "Public features are viewable by everyone." on property_features for select using (true);

-- Indexes for Map Search speed
create index properties_lat_lng_idx on properties (lat, lng);
create index properties_price_idx on properties (price);
create index properties_listing_type_idx on properties (listing_type);
