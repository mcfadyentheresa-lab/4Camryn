-- Replace broad public SELECT with owner-scoped SELECT.
-- Direct URL access on a public bucket works without RLS; this policy
-- only governs list() calls, so scope it to the authenticated owner's folder.
DROP POLICY IF EXISTS "loves_images_select" ON storage.objects;

CREATE POLICY "loves_images_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'loves-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
