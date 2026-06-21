ALTER TABLE camryn_likes ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';

-- Create the loves-images storage bucket (public read for direct img src usage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loves-images',
  'loves-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Upload: authenticated users can write to their own folder (uid/filename)
CREATE POLICY "loves_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'loves-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: public (bucket is public so these rows are reachable via URL)
CREATE POLICY "loves_images_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'loves-images');

-- Delete: only own files
CREATE POLICY "loves_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'loves-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
