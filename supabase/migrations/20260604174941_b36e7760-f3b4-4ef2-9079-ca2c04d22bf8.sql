
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  segment TEXT NOT NULL DEFAULT 'Residential',
  state TEXT,
  city TEXT,
  address TEXT,
  sanction_load_kw NUMERIC,
  contract_demand_kva NUMERIC,
  monthly_bill_inr NUMERIC,
  avg_units_kwh NUMERIC,
  tariff_inr_per_kwh NUMERIC,
  roof_area_sqm NUMERIC,
  roof_type TEXT,
  shadow_free_pct NUMERIC DEFAULT 90,
  discom TEXT,
  consumer_no TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  bill_extraction JSONB,
  feasibility JSONB,
  design JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own leads" ON public.leads
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_owner_status ON public.leads(owner_id, status);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
