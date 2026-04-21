
CREATE TABLE public.tile_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tile_key TEXT NOT NULL,
  destination TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tile_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tile clicks"
ON public.tile_clicks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view tile clicks"
ON public.tile_clicks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_tile_clicks_tile_key ON public.tile_clicks(tile_key);
CREATE INDEX idx_tile_clicks_created_at ON public.tile_clicks(created_at DESC);
