
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Branding logos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

CREATE POLICY "Users upload their own branding"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update their own branding"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete their own branding"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'branding' AND auth.uid()::text = (storage.foldername(name))[1]);
