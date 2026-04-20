
CREATE TABLE public.community_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Community Proposal',
  community_name TEXT,
  location TEXT,
  blocks INTEGER,
  rooftop_area_sft NUMERIC,
  monthly_units NUMERIC,
  monthly_bill NUMERIC,
  sanction_load_kw NUMERIC,
  roof_type TEXT,
  preferred_model TEXT,
  target_savings_pct NUMERIC,
  investor_required BOOLEAN DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'Dark Premium',
  cover_image_url TEXT,
  computed JSONB NOT NULL DEFAULT '{}'::jsonb,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own community proposals"
ON public.community_proposals FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own community proposals"
ON public.community_proposals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own community proposals"
ON public.community_proposals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own community proposals"
ON public.community_proposals FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_community_proposals_updated_at
BEFORE UPDATE ON public.community_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_community_proposals_user ON public.community_proposals(user_id, updated_at DESC);
