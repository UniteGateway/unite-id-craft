CREATE TABLE public.brand_palettes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view brand palettes"
  ON public.brand_palettes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins insert brand palettes"
  ON public.brand_palettes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update brand palettes"
  ON public.brand_palettes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete brand palettes"
  ON public.brand_palettes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_brand_palettes_updated_at
  BEFORE UPDATE ON public.brand_palettes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Unite Solar default palette
INSERT INTO public.brand_palettes (name, colors) VALUES
  ('Unite Solar', '["#f08c00","#3a3a3a","#1a3c6e","#ffffff","#f5f5f5"]'::jsonb),
  ('Sunset', '["#ff6b35","#f7931e","#fdc830","#3a3a3a","#ffffff"]'::jsonb),
  ('Ocean', '["#0077b6","#00b4d8","#90e0ef","#03045e","#ffffff"]'::jsonb);
