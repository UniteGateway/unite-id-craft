
CREATE TABLE public.solar_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  location TEXT,
  project_type TEXT,
  capacity_mw NUMERIC NOT NULL DEFAULT 1,
  investment_model TEXT,
  approx_budget TEXT,
  custom_notes TEXT,
  computed JSONB NOT NULL DEFAULT '{}'::jsonb,
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_recommendation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solar_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own solar proposals" ON public.solar_proposals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own solar proposals" ON public.solar_proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own solar proposals" ON public.solar_proposals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own solar proposals" ON public.solar_proposals
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_solar_proposals_updated_at
  BEFORE UPDATE ON public.solar_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_solar_proposals_user ON public.solar_proposals(user_id, created_at DESC);
