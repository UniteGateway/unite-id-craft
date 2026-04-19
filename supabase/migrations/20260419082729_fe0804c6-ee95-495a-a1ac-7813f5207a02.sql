-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Visiting card templates (uploaded or AI-generated)
CREATE TABLE public.visiting_card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('upload','ai')),
  image_url TEXT NOT NULL,
  width_px INTEGER,
  height_px INTEGER,
  field_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visiting_card_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own templates" ON public.visiting_card_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own templates" ON public.visiting_card_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own templates" ON public.visiting_card_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own templates" ON public.visiting_card_templates FOR DELETE USING (auth.uid() = user_id);

-- Saved visiting cards (history / dashboard)
CREATE TABLE public.visiting_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.visiting_card_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visiting_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cards" ON public.visiting_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cards" ON public.visiting_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cards" ON public.visiting_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cards" ON public.visiting_cards FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER vct_updated_at BEFORE UPDATE ON public.visiting_card_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER vc_updated_at BEFORE UPDATE ON public.visiting_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for templates
INSERT INTO storage.buckets (id, name, public) VALUES ('card-templates', 'card-templates', true);
CREATE POLICY "Templates publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'card-templates');
CREATE POLICY "Users upload own templates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'card-templates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own template files" ON storage.objects FOR UPDATE USING (bucket_id = 'card-templates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own template files" ON storage.objects FOR DELETE USING (bucket_id = 'card-templates' AND auth.uid()::text = (storage.foldername(name))[1]);