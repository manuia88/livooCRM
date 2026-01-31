-- Migration: 0018_storage_buckets
-- Description: Create storage bucket for property images + policies

-- Create bucket 'properties-images' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties-images', 'properties-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give read access to everyone
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties-images' );

-- Policy: Give upload access to authenticated users
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'properties-images' );

-- Policy: Users can update their own images (optional, complex to track owner if not in metadata)
-- For simplicity, allowing authenticated update for now, or restriction based on path prefix
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'properties-images' );

-- Policy: Users can delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'properties-images' );
