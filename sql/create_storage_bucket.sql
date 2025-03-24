
-- This file is just for reference. Execute this if you need to create the storage bucket manually.

INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'Media Files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-files');

-- Allow public access to view files
CREATE POLICY "Allow public access to media files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-files');
