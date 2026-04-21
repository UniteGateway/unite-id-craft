
-- 1) Persist parsed bill + warranties/AMC/location on the proposal row
ALTER TABLE public.residential_proposals
  ADD COLUMN IF NOT EXISTS bill_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS warranties text,
  ADD COLUMN IF NOT EXISTS service_amc text,
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS location_state text,
  ADD COLUMN IF NOT EXISTS daily_generation_kwh_per_kw numeric;

-- 2) Single-row admin defaults block
CREATE TABLE IF NOT EXISTS public.proposal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  warranties text NOT NULL DEFAULT '',
  service_amc text NOT NULL DEFAULT '',
  general_terms text NOT NULL DEFAULT '',
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view proposal settings"
  ON public.proposal_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins insert proposal settings"
  ON public.proposal_settings FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update proposal settings"
  ON public.proposal_settings FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER trg_proposal_settings_updated_at
  BEFORE UPDATE ON public.proposal_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the singleton row
INSERT INTO public.proposal_settings (singleton, warranties, service_amc, general_terms)
VALUES (
  true,
  E'• Solar Modules: 25 years linear performance warranty (80% output at year 25), 12 years product warranty.\n• Inverter: 5 years standard manufacturer warranty (extendable up to 10 years).\n• Mounting Structure: 10 years against manufacturing defects.\n• Cables, ACDB/DCDB, BoS: 5 years.\n• Workmanship: 5 years from date of commissioning.',
  E'• Year 1 — Free preventive maintenance visit (panel cleaning + system health check).\n• Annual Maintenance Contract (AMC) available from Year 2 onwards.\n• Standard AMC: 2 visits/year — panel cleaning, IV-curve check, inverter diagnostics, earthing test, MCB & cable inspection.\n• Premium AMC: 4 visits/year + remote monitoring + 24×7 support.\n• Emergency call-out within 48 hours across our service network.',
  E'1. Quotation valid for 15 days from date of issue.\n2. Payment: 70% advance with PO; 20% on material delivery; 10% on commissioning.\n3. Delivery & commissioning within 30 working days from advance + site readiness.\n4. Civil work, scaffolding, and shadow removal in client scope unless quoted.\n5. Net-meter / DISCOM liaison support included; govt fees at actuals.\n6. Insurance & taxes at actuals; GST 13.8% blended (5% goods, 18% services).\n7. Force majeure & site-specific civil hindrances are not part of scope.'
)
ON CONFLICT (singleton) DO NOTHING;
