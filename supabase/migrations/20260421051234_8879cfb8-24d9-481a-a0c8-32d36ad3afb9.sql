
-- =========================================
-- residential_presets (admin-editable defaults)
-- =========================================
CREATE TABLE public.residential_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capacity_kw NUMERIC NOT NULL UNIQUE,
  label TEXT NOT NULL,
  cost_per_kw NUMERIC NOT NULL DEFAULT 55000,
  panel_wattage NUMERIC NOT NULL DEFAULT 550,
  panel_count INTEGER NOT NULL DEFAULT 0,
  inverter_capacity NUMERIC NOT NULL DEFAULT 0,
  structure_type TEXT NOT NULL DEFAULT 'GI elevated rooftop structure',
  boq JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_and_conditions TEXT NOT NULL DEFAULT '',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residential_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view residential presets"
  ON public.residential_presets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins insert residential presets"
  ON public.residential_presets FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update residential presets"
  ON public.residential_presets FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete residential presets"
  ON public.residential_presets FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_residential_presets_updated_at
  BEFORE UPDATE ON public.residential_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- residential_proposals (per-user)
-- =========================================
CREATE TABLE public.residential_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Residential Proposal',
  proposal_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft',

  is_customised BOOLEAN NOT NULL DEFAULT false,
  preset_id UUID REFERENCES public.residential_presets(id) ON DELETE SET NULL,

  -- client
  client_name TEXT,
  client_location TEXT,
  client_contact TEXT,
  client_email TEXT,

  -- system
  capacity_kw NUMERIC,
  panel_wattage NUMERIC,
  panel_count INTEGER,
  inverter_capacity NUMERIC,
  structure_type TEXT,

  -- pricing
  cost_per_kw NUMERIC,
  boq JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_and_conditions TEXT,

  -- cover
  cover_image_url TEXT,
  cover_source TEXT,

  computed JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residential_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own residential proposals"
  ON public.residential_proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own residential proposals"
  ON public.residential_proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own residential proposals"
  ON public.residential_proposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own residential proposals"
  ON public.residential_proposals FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_residential_proposals_updated_at
  BEFORE UPDATE ON public.residential_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_residential_proposals_user ON public.residential_proposals(user_id, updated_at DESC);

-- =========================================
-- Seed 2–10 kW presets with itemized BOQ
-- =========================================
DO $$
DECLARE
  kw NUMERIC;
  panels INT;
  inv NUMERIC;
  cpk NUMERIC := 55000;
  total NUMERIC;
  std_terms TEXT := E'1. Quotation valid for 15 days from date of issue.\n2. 70% advance with PO; 20% on material delivery; 10% on commissioning.\n3. Delivery & commissioning within 30 working days from advance + site readiness.\n4. Civil work, scaffolding, shed/tree shadow removal in client scope unless quoted.\n5. Net-meter / DISCOM liaison support included; govt fees at actuals.\n6. Workmanship warranty: 5 years. Module warranty: 25 yrs (linear performance) / 12 yrs (product) as per OEM. Inverter warranty: 5–10 yrs as per OEM.\n7. Insurance & taxes at actuals; GST 13.8% blended (5% goods, 18% services).\n8. Force majeure & site-specific civil hindrances are not part of scope.';
BEGIN
  FOR kw IN SELECT generate_series(2, 10) LOOP
    panels := CEIL((kw * 1000.0) / 550.0);
    inv := kw; -- 1:1 inverter sizing for residential
    total := kw * cpk;

    INSERT INTO public.residential_presets
      (capacity_kw, label, cost_per_kw, panel_wattage, panel_count, inverter_capacity, structure_type, boq, terms_and_conditions, notes)
    VALUES (
      kw,
      kw || ' kW Residential Rooftop',
      cpk,
      550,
      panels,
      inv,
      'GI elevated rooftop structure (8–10 ft)',
      jsonb_build_array(
        jsonb_build_object('item','Mono PERC / TopCon Solar Modules 550 Wp (Tier-1)', 'qty', panels, 'unit', 'Nos', 'rate', 12500, 'amount', panels*12500),
        jsonb_build_object('item','String Inverter ' || inv || ' kW (Single/Three Phase)', 'qty', 1, 'unit', 'No', 'rate', kw*7500, 'amount', kw*7500),
        jsonb_build_object('item','GI Elevated Module Mounting Structure', 'qty', kw, 'unit', 'kW', 'rate', 6500, 'amount', kw*6500),
        jsonb_build_object('item','DC Cables (4 sq.mm Solar) + MC4 connectors', 'qty', kw, 'unit', 'kW', 'rate', 1800, 'amount', kw*1800),
        jsonb_build_object('item','AC Cables (Aluminium / Copper as per load)', 'qty', kw, 'unit', 'kW', 'rate', 1500, 'amount', kw*1500),
        jsonb_build_object('item','ACDB + DCDB with SPDs & MCBs', 'qty', 1, 'unit', 'Set', 'rate', 6500, 'amount', 6500),
        jsonb_build_object('item','Earthing kit (3 pits) + Lightning Arrestor', 'qty', 1, 'unit', 'Set', 'rate', 8500, 'amount', 8500),
        jsonb_build_object('item','Cable Trays, Conduits & Accessories', 'qty', kw, 'unit', 'kW', 'rate', 1200, 'amount', kw*1200),
        jsonb_build_object('item','Civil work (foundation grouting / parapet anchors)', 'qty', 1, 'unit', 'Lot', 'rate', kw*1500, 'amount', kw*1500),
        jsonb_build_object('item','Installation, Commissioning & Testing', 'qty', kw, 'unit', 'kW', 'rate', 3500, 'amount', kw*3500),
        jsonb_build_object('item','Net-meter coordination & DISCOM liaison', 'qty', 1, 'unit', 'Lot', 'rate', 5000, 'amount', 5000),
        jsonb_build_object('item','Transport, Insurance & Site Logistics', 'qty', 1, 'unit', 'Lot', 'rate', kw*1000, 'amount', kw*1000)
      ),
      std_terms,
      'Default preset for ' || kw || ' kW residential rooftop. Edit prices, BOQ, and T&C from the editor.'
    );
  END LOOP;
END $$;
