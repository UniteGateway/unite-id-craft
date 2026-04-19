-- Proposals table for Unite Solar proposal generator
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Proposal',
  proposal_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft',

  -- Cover
  cover_image_url TEXT,
  cover_source TEXT, -- 'ai' | 'upload' | 'default'

  -- Client details
  client_name TEXT,
  client_location TEXT,
  client_contact TEXT,
  client_email TEXT,
  project_type TEXT, -- 'Ground' | 'Rooftop'
  capacity_kw NUMERIC,
  soil_type TEXT,   -- 'Moram' | 'Rock' | 'Mixed'

  -- Technical
  panel_count INTEGER,
  panel_wattage NUMERIC,
  inverter_capacity NUMERIC,
  structure_type TEXT,

  -- Civil
  boundary_length_rmt NUMERIC,
  wall_type TEXT,
  footing_count INTEGER,

  -- Financials (₹)
  cost_per_kw NUMERIC,
  civil_cost_per_rmt NUMERIC,
  footing_cost NUMERIC,
  electricity_tariff NUMERIC,

  -- Add-ons & options
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Computed snapshot (frozen at save)
  computed JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Editable text overrides (per-page)
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own proposals" ON public.proposals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own proposals" ON public.proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own proposals" ON public.proposals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own proposals" ON public.proposals
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_proposals_user ON public.proposals(user_id, updated_at DESC);

-- Storage bucket for proposal covers + exported PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read proposals bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'proposals');

CREATE POLICY "Users upload to own proposals folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own proposal files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own proposal files"
ON storage.objects FOR DELETE
USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);