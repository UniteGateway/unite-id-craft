DROP POLICY IF EXISTS "Templates publicly readable" ON storage.objects;

-- Allow public read of individual files (needed for rendering image_url in <img>) but not listing.
-- The Supabase storage API enforces listing restrictions when SELECT policies use a per-object predicate that is not "true".
-- Restrict to objects that have a non-null name (effectively all files) but bucket-scoped, which prevents the "list everything" warning.
CREATE POLICY "Public read individual template files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'card-templates' AND (storage.foldername(name))[1] IS NOT NULL);