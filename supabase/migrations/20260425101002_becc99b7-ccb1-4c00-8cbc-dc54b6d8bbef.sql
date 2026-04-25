-- Storage bucket for fixed proposal slide assets (A4 images / PDFs uploaded by admin)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fixed-slides', 'fixed-slides', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for the bucket
CREATE POLICY "Public read fixed-slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'fixed-slides');

CREATE POLICY "Admins upload fixed-slides"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fixed-slides' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update fixed-slides"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fixed-slides' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete fixed-slides"
ON storage.objects FOR DELETE
USING (bucket_id = 'fixed-slides' AND public.has_role(auth.uid(), 'admin'));

-- Table to store admin-uploaded fixed slide content (one or more assets per slide number 1..9)
CREATE TABLE public.fixed_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slide_number INTEGER NOT NULL CHECK (slide_number BETWEEN 1 AND 9),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fixed_slides_slide_number ON public.fixed_slides(slide_number, sort_order);

ALTER TABLE public.fixed_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view active fixed slides"
ON public.fixed_slides FOR SELECT
TO authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert fixed slides"
ON public.fixed_slides FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update fixed slides"
ON public.fixed_slides FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete fixed slides"
ON public.fixed_slides FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fixed_slides_updated_at
BEFORE UPDATE ON public.fixed_slides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();