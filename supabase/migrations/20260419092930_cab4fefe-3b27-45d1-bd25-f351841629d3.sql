-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. API keys (admin-managed, used by edge functions via service role)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE, -- 'openai', 'gemini', etc.
  api_key TEXT NOT NULL,
  label TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can see/manage. Edge functions use service role to read.
CREATE POLICY "Admins view api keys" ON public.api_keys
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert api keys" ON public.api_keys
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update api keys" ON public.api_keys
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete api keys" ON public.api_keys
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Brand library (shared, admin-managed, all authed users can read)
CREATE TABLE public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'image', 'icon')),
  image_url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view brand assets" ON public.brand_assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert brand assets" ON public.brand_assets
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update brand assets" ON public.brand_assets
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete brand assets" ON public.brand_assets
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 4. Saved social designs (per-user)
CREATE TABLE public.social_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('instagram_post', 'instagram_story')),
  model TEXT,
  prompt TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own designs" ON public.social_designs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own designs" ON public.social_designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own designs" ON public.social_designs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own designs" ON public.social_designs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER social_designs_updated_at BEFORE UPDATE ON public.social_designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('brand-assets', 'brand-assets', true),
  ('social-designs', 'social-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Brand-assets bucket policies
CREATE POLICY "Public read brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');
CREATE POLICY "Admins upload brand assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update brand assets storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete brand assets storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));

-- Social-designs bucket policies (per-user folder)
CREATE POLICY "Public read social designs" ON storage.objects
  FOR SELECT USING (bucket_id = 'social-designs');
CREATE POLICY "Users upload own social designs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'social-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own social designs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'social-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own social designs" ON storage.objects
  FOR DELETE USING (bucket_id = 'social-designs' AND auth.uid()::text = (storage.foldername(name))[1]);