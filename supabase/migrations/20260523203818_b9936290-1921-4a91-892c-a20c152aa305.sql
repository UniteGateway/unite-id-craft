
-- Covering letters history
CREATE TABLE public.covering_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  template_id text,
  template_name text,
  date date,
  to_name text,
  to_designation text,
  to_org text,
  to_address text,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  sender_name text,
  sender_designation text,
  signature_url text,
  client_email text,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.covering_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own letters"
  ON public.covering_letters FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own letters"
  ON public.covering_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own letters"
  ON public.covering_letters FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own letters"
  ON public.covering_letters FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_covering_letters_updated_at
  BEFORE UPDATE ON public.covering_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Signature image storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('letter-signatures', 'letter-signatures', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'letter-signatures');

CREATE POLICY "Users upload own signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'letter-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own signatures"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'letter-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own signatures"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'letter-signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
