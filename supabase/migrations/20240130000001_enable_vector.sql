-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 1. Table for Legal/Fiscal Knowledge Base (RAG)
create table if not exists legal_documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(768), -- text-embedding-004 dimension
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster similarity search on legal_documents
create index if not exists legal_documents_embedding_idx on legal_documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 2. Embeddings for Properties (Visual Matcher)
create table if not exists property_embeddings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  image_url text, -- The specific image that was embedded
  embedding vector(768), -- Gemini Vision or text embedding dimension
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for property embeddings
create index if not exists property_embeddings_idx on property_embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 3. Table for Lead Scores
create table if not exists lead_scores (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade not null,
  score integer check (score >= 0 and score <= 100),
  category text check (category in ('HOT', 'WARM', 'COLD')),
  closing_probability float check (closing_probability >= 0 and closing_probability <= 1),
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(contact_id)
);

-- 4. Table for Sentiment Logs
create table if not exists sentiment_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  message_content text,
  sentiment_score integer check (sentiment_score >= 0 and sentiment_score <= 100), -- 0=Negative, 100=Positive
  sentiment_label text check (sentiment_label in ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table legal_documents enable row level security;
alter table property_embeddings enable row level security;
alter table lead_scores enable row level security;
alter table sentiment_logs enable row level security;

-- Policies (Basic simplified policies for now)
-- Allow authenticated users to read legal docs
create policy "Authenticated users can read legal docs"
  on legal_documents for select
  to authenticated
  using (true);

-- Allow authenticated users to read/insert property embeddings
create policy "Authenticated users can manage property embeddings"
  on property_embeddings for all
  to authenticated
  using (true);

-- Lead scores visible to agents
create policy "Agents view lead scores"
  on lead_scores for select
  to authenticated
  using (true);

-- Sentiment logs visible to agents
create policy "Agents view sentiment logs"
  on sentiment_logs for select
  to authenticated
  using (true);
