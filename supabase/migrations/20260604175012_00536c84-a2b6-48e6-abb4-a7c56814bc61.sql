
CREATE POLICY "Owners read own power bills" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'power-bills' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners upload own power bills" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'power-bills' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners update own power bills" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'power-bills' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners delete own power bills" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'power-bills' AND auth.uid()::text = (storage.foldername(name))[1]);
