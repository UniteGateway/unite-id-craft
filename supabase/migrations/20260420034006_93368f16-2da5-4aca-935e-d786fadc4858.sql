-- Allow new stationery kinds in design_templates and designs

ALTER TABLE public.design_templates DROP CONSTRAINT design_templates_kind_check;
ALTER TABLE public.design_templates ADD CONSTRAINT design_templates_kind_check
  CHECK (kind IN ('flyer','brochure','presentation','letterhead','envelope','billbook','voucher'));

ALTER TABLE public.designs DROP CONSTRAINT designs_kind_check;
ALTER TABLE public.designs ADD CONSTRAINT designs_kind_check
  CHECK (kind IN ('flyer','brochure','presentation','letterhead','envelope','billbook','voucher'));
