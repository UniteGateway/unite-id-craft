
-- Add columns to residential_presets
ALTER TABLE public.residential_presets
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Residential',
  ADD COLUMN IF NOT EXISTS subsidy_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subsidy_per_kw NUMERIC NOT NULL DEFAULT 0;

-- Add columns to residential_proposals
ALTER TABLE public.residential_proposals
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Residential',
  ADD COLUMN IF NOT EXISTS subsidy_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subsidy_per_kw NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offer_id UUID,
  ADD COLUMN IF NOT EXISTS offer_discount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offer_label TEXT,
  ADD COLUMN IF NOT EXISTS payment_mode TEXT NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS loan_interest_rate NUMERIC NOT NULL DEFAULT 9.5,
  ADD COLUMN IF NOT EXISTS loan_tenure_years NUMERIC NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS subsidy_in_loan BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS monthly_savings_per_kw NUMERIC NOT NULL DEFAULT 1000;

-- Create residential_offers table
CREATE TABLE IF NOT EXISTS public.residential_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_kw NUMERIC NOT NULL DEFAULT 0,
  max_kw NUMERIC NOT NULL DEFAULT 999,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  freebie_label TEXT,
  flyer_image_url TEXT,
  flyer_storage_path TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.residential_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users view active offers"
  ON public.residential_offers FOR SELECT
  TO authenticated
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert offers"
  ON public.residential_offers FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update offers"
  ON public.residential_offers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete offers"
  ON public.residential_offers FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_residential_offers_updated_at
  BEFORE UPDATE ON public.residential_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default residential subsidies on existing presets (1kW=30k, 2kW=60k, 3kW+=78k)
UPDATE public.residential_presets
SET subsidy_amount = CASE
  WHEN capacity_kw = 1 THEN 30000
  WHEN capacity_kw = 2 THEN 60000
  WHEN capacity_kw >= 3 THEN 78000
  ELSE 0
END
WHERE category = 'Residential';

-- Seed example offers
INSERT INTO public.residential_offers (name, description, min_kw, max_kw, discount_amount, freebie_label, active)
VALUES
  ('Festive Cashback', 'Flat ₹5,000 off on all systems', 2, 10, 5000, NULL, true),
  ('Free Electric Scooter', 'Complimentary electric scooter on 5 kW & above', 5, 10, 0, 'Free Electric Scooter (worth ₹70,000)', true),
  ('Free Smart Meter', 'Free smart energy meter with installation', 3, 10, 0, 'Free Smart Energy Meter', true)
ON CONFLICT DO NOTHING;
