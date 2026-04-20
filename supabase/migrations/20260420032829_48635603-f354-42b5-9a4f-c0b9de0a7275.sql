-- Shared design templates (admin/team) and private user designs for flyers, brochures, presentations

CREATE TABLE public.design_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('flyer','brochure','presentation')),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  source TEXT NOT NULL DEFAULT 'upload',
  field_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
  width_px INTEGER,
  height_px INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view design templates" ON public.design_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert design templates" ON public.design_templates FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins update design templates" ON public.design_templates FOR UPDATE USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins delete design templates" ON public.design_templates FOR DELETE USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_design_templates_updated BEFORE UPDATE ON public.design_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('flyer','brochure','presentation')),
  title TEXT NOT NULL DEFAULT 'Untitled',
  template_id UUID REFERENCES public.design_templates(id) ON DELETE SET NULL,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own designs" ON public.designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_designs_updated BEFORE UPDATE ON public.designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public bucket for shared design template images
INSERT INTO storage.buckets (id, name, public) VALUES ('design-templates','design-templates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read design-templates" ON storage.objects FOR SELECT USING (bucket_id = 'design-templates');
CREATE POLICY "Admins write design-templates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'design-templates' AND has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins update design-templates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'design-templates' AND has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins delete design-templates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'design-templates' AND has_role(auth.uid(),'admin'::app_role));
