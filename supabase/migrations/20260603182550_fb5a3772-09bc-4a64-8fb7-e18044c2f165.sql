
-- ============ PRICE BOOK TABLES ============

CREATE TABLE public.price_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  technology text NOT NULL,
  wattage int NOT NULL,
  price_per_wp numeric NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_modules TO authenticated;
GRANT ALL ON public.price_modules TO service_role;
ALTER TABLE public.price_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read modules" ON public.price_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write modules" ON public.price_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.price_inverters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text,
  capacity_kw numeric NOT NULL,
  phase text NOT NULL DEFAULT '3P',
  price numeric NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_inverters TO authenticated;
GRANT ALL ON public.price_inverters TO service_role;
ALTER TABLE public.price_inverters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read inv" ON public.price_inverters FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write inv" ON public.price_inverters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.price_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  rate_per_wp numeric NOT NULL,
  height_premium_per_floor_pct numeric NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_structures TO authenticated;
GRANT ALL ON public.price_structures TO service_role;
ALTER TABLE public.price_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read str" ON public.price_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write str" ON public.price_structures FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.price_bos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  item text NOT NULL,
  unit text NOT NULL,
  rate numeric NOT NULL,
  per_kw_qty numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_bos TO authenticated;
GRANT ALL ON public.price_bos TO service_role;
ALTER TABLE public.price_bos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read bos" ON public.price_bos FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write bos" ON public.price_bos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.price_labour (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment text NOT NULL UNIQUE,
  rate_per_wp numeric NOT NULL,
  installation_per_kw numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_labour TO authenticated;
GRANT ALL ON public.price_labour TO service_role;
ALTER TABLE public.price_labour ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read lab" ON public.price_labour FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write lab" ON public.price_labour FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.price_state_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL UNIQUE,
  net_metering_charge_per_kw numeric NOT NULL DEFAULT 0,
  statutory_charge_per_kw numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_state_policies TO authenticated;
GRANT ALL ON public.price_state_policies TO service_role;
ALTER TABLE public.price_state_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sp" ON public.price_state_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write sp" ON public.price_state_policies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.subsidy_slabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme text NOT NULL DEFAULT 'PM Surya Ghar',
  kw_min numeric NOT NULL,
  kw_max numeric NOT NULL,
  amount numeric NOT NULL,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subsidy_slabs TO authenticated;
GRANT ALL ON public.subsidy_slabs TO service_role;
ALTER TABLE public.subsidy_slabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sub" ON public.subsidy_slabs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write sub" ON public.subsidy_slabs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pricing_settings (
  id int PRIMARY KEY DEFAULT 1,
  company_margin_pct numeric NOT NULL DEFAULT 15,
  sales_margin_pct numeric NOT NULL DEFAULT 5,
  channel_partner_margin_pct numeric NOT NULL DEFAULT 3,
  franchise_margin_pct numeric NOT NULL DEFAULT 2,
  gst_pct numeric NOT NULL DEFAULT 13.8,
  design_charges_per_kw numeric NOT NULL DEFAULT 500,
  installation_per_kw numeric NOT NULL DEFAULT 2500,
  logistics_per_kw numeric NOT NULL DEFAULT 800,
  statutory_per_kw numeric NOT NULL DEFAULT 600,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
GRANT SELECT ON public.pricing_settings TO authenticated;
GRANT ALL ON public.pricing_settings TO service_role;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read ps" ON public.pricing_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write ps" ON public.pricing_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  company_name text,
  mobile text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  project_type text,
  connection_type text,
  segment text NOT NULL DEFAULT 'residential',
  capacity_kw numeric NOT NULL,
  module_id uuid,
  inverter_id uuid,
  structure_type text,
  floors int DEFAULT 0,
  tariff numeric,
  costing jsonb NOT NULL DEFAULT '{}'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  gst numeric NOT NULL DEFAULT 0,
  final_price numeric NOT NULL DEFAULT 0,
  subsidy numeric NOT NULL DEFAULT 0,
  net_to_customer numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quotations" ON public.quotations FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER t_pm BEFORE UPDATE ON public.price_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_pi BEFORE UPDATE ON public.price_inverters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_ps BEFORE UPDATE ON public.price_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_pb BEFORE UPDATE ON public.price_bos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_pl BEFORE UPDATE ON public.price_labour FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_psp BEFORE UPDATE ON public.price_state_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_ss BEFORE UPDATE ON public.subsidy_slabs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_psg BEFORE UPDATE ON public.pricing_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_q BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED DATA ============

INSERT INTO public.price_modules (brand,technology,wattage,price_per_wp) VALUES
('Waaree','Mono PERC',540,17.5),
('Waaree','TOPCon',550,19),
('Waaree','N-Type Bifacial',600,20.5),
('Adani','Mono PERC',540,17),
('Adani','TOPCon',550,18.8),
('Tata','Mono PERC',540,18),
('Tata','TOPCon',575,19.5),
('Vikram','Mono PERC',540,16.8),
('RenewSys','Mono PERC',540,16.5),
('Longi','TOPCon',575,19.2),
('Longi','N-Type Bifacial',600,20.8),
('JA Solar','TOPCon',575,19.0);

INSERT INTO public.price_inverters (brand,model,capacity_kw,phase,price) VALUES
('Growatt','MIN 3000TL-X',3,'1P',32000),
('Growatt','MIN 5000TL-X',5,'1P',48000),
('Growatt','MID 10KTL3-X',10,'3P',95000),
('Growatt','MAX 50KTL3-X',50,'3P',285000),
('Sungrow','SG5K-D',5,'1P',52000),
('Sungrow','SG10RT',10,'3P',105000),
('Sungrow','SG33CX',33,'3P',225000),
('Sungrow','SG110CX',110,'3P',650000),
('Solis','S6-GR1P5K',5,'1P',46000),
('Solis','S5-GC25K',25,'3P',180000),
('Goodwe','GW5000-NS',5,'1P',47000),
('Goodwe','GW50K-MT',50,'3P',290000),
('Huawei','SUN2000-5KTL',5,'1P',55000),
('Huawei','SUN2000-100KTL',100,'3P',620000);

INSERT INTO public.price_structures (type,rate_per_wp,height_premium_per_floor_pct) VALUES
('RCC Roof',7,5),
('Tin Shed',6,3),
('Metal Roof',6.5,3),
('Elevated',10,5),
('Ground Mounted',8,0),
('Parking Structure',15,0),
('High Wind',12,5);

INSERT INTO public.price_bos (category,item,unit,rate,per_kw_qty) VALUES
('Cable','DC Cable 4 sqmm','m',45,20),
('Cable','AC Cable 4 sqmm','m',55,15),
('Cable','Earthing Cable 6 sqmm','m',40,10),
('Protection','ACDB','set',3500,0.1),
('Protection','DCDB','set',4000,0.1),
('Protection','Lightning Arrestor','set',2500,0.05),
('Protection','Earthing Kit','set',3500,0.1),
('Connectors','MC4 Connector Pair','pair',150,2),
('Civil','Earthing Pit','set',6000,0.05);

INSERT INTO public.price_labour (segment,rate_per_wp,installation_per_kw) VALUES
('residential',4,2500),
('commercial',3,2000),
('industrial',2.5,1800);

INSERT INTO public.price_state_policies (state,net_metering_charge_per_kw,statutory_charge_per_kw) VALUES
('Telangana',500,600),
('Andhra Pradesh',500,600),
('Karnataka',700,800),
('Tamil Nadu',600,700),
('Maharashtra',800,900),
('Kerala',500,600),
('Gujarat',600,700),
('Delhi',400,500);

INSERT INTO public.subsidy_slabs (scheme,kw_min,kw_max,amount,notes) VALUES
('PM Surya Ghar',0,1,30000,'₹30,000 for first 1 kW'),
('PM Surya Ghar',1,2,60000,'₹60,000 cumulative up to 2 kW'),
('PM Surya Ghar',2,3,78000,'₹78,000 cap for 3 kW & above (residential)'),
('PM Surya Ghar',3,10,78000,'Subsidy capped at ₹78,000 for residential ≤10 kW');

INSERT INTO public.pricing_settings (id) VALUES (1);
