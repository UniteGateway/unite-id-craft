export type FieldType = "text" | "textarea" | "date" | "number";

export interface AgreementField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  default?: string;
}

export interface AgreementSection {
  heading: string;
  /** Body. Use {{key}} placeholders that map to field keys. */
  body: string;
}

export interface AgreementDef {
  slug: string;
  title: string;
  short: string;
  description: string;
  /** Tailwind hue gradient for tile */
  hue: string;
  /** Royalty-free Unsplash thumbnail */
  image: string;
  fields: AgreementField[];
  sections: AgreementSection[];
}

const COMPANY_FIELDS: AgreementField[] = [
  { key: "company_name", label: "Company Name", type: "text", default: "Unite Developers Global Inc" },
  { key: "company_address", label: "Company Registered Address", type: "textarea", default: "Jubilee Hills, Hyderabad, Telangana, India" },
  { key: "company_rep", label: "Authorised Signatory (Company)", type: "text", placeholder: "Full name & designation" },
  { key: "effective_date", label: "Effective Date", type: "date" },
  { key: "place", label: "Place of Execution", type: "text", default: "Hyderabad" },
];

const COUNTERPARTY = (label: string): AgreementField[] => [
  { key: "party_name", label: `${label} Name`, type: "text" },
  { key: "party_address", label: `${label} Address`, type: "textarea" },
  { key: "party_rep", label: `${label} Authorised Signatory`, type: "text", placeholder: "Full name & designation" },
  { key: "party_pan", label: `${label} PAN / GSTIN`, type: "text" },
];

export const AGREEMENTS: AgreementDef[] = [
  {
    slug: "franchise",
    title: "Franchise Agreement",
    short: "Franchise",
    description: "Authorise a franchisee to operate under the Unite Solar brand in a defined territory.",
    hue: "from-orange-500 to-amber-400",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Franchisee"),
      { key: "territory", label: "Exclusive Territory", type: "text", placeholder: "e.g. Hyderabad – Cyberabad zone" },
      { key: "term_years", label: "Term (Years)", type: "number", default: "5" },
      { key: "franchise_fee", label: "One-time Franchise Fee (INR)", type: "number" },
      { key: "royalty_pct", label: "Royalty / Revenue Share (%)", type: "number", default: "5" },
      { key: "min_targets", label: "Minimum Annual Targets", type: "textarea", placeholder: "kW installed, revenue, etc." },
    ],
    sections: [
      { heading: "1. Grant of Franchise", body: "{{company_name}} (\"Franchisor\") hereby grants to {{party_name}} (\"Franchisee\") a non-transferable, limited right to operate a Unite Solar franchise outlet within the territory of {{territory}}, using the Franchisor's trademarks, systems, processes, and brand identity, subject to the terms of this Agreement." },
      { heading: "2. Term", body: "This Agreement shall commence on {{effective_date}} and remain in force for a period of {{term_years}} years, renewable by mutual written consent at least ninety (90) days prior to expiry." },
      { heading: "3. Fees & Royalty", body: "The Franchisee shall pay a one-time, non-refundable franchise fee of INR {{franchise_fee}} on signing. In addition, the Franchisee shall remit a royalty of {{royalty_pct}}% of monthly gross revenue to the Franchisor by the 7th of the following month." },
      { heading: "4. Brand & Operating Standards", body: "The Franchisee shall strictly comply with Unite Solar's Brand Manual, Standard Operating Procedures, training requirements, customer service standards, pricing guidelines, and quality benchmarks as may be updated by the Franchisor from time to time." },
      { heading: "5. Performance Obligations", body: "The Franchisee shall achieve the following minimum annual performance targets: {{min_targets}}. Failure to meet 80% of agreed targets in any contract year may, at the Franchisor's sole discretion, lead to loss of territorial exclusivity or termination." },
      { heading: "6. Confidentiality & IP", body: "All trademarks, designs, technical know-how, customer data, and operating manuals are the exclusive property of the Franchisor. The Franchisee shall not disclose, copy, or use such material outside the scope of this Agreement, both during the term and for three (3) years after termination." },
      { heading: "7. Termination", body: "Either party may terminate this Agreement with sixty (60) days written notice for material breach uncured within thirty (30) days. The Franchisor may terminate with immediate effect for fraud, brand damage, insolvency, or non-payment of dues." },
      { heading: "8. Governing Law & Jurisdiction", body: "This Agreement shall be governed by the laws of India. Courts at {{place}} shall have exclusive jurisdiction over any disputes arising hereunder, subject to arbitration under the Arbitration and Conciliation Act, 1996." },
    ],
  },
  {
    slug: "agent",
    title: "Agent Agreement",
    short: "Agent",
    description: "Engage a sales/channel agent to source customer leads on a commission basis.",
    hue: "from-blue-600 to-cyan-400",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Agent"),
      { key: "territory", label: "Operating Territory", type: "text" },
      { key: "term_years", label: "Term (Years)", type: "number", default: "1" },
      { key: "commission_pct", label: "Commission on Net Order Value (%)", type: "number", default: "3" },
      { key: "payout_terms", label: "Payout Terms", type: "textarea", default: "Within 15 days of customer milestone payment realised in full." },
    ],
    sections: [
      { heading: "1. Appointment", body: "{{company_name}} (\"Principal\") hereby appoints {{party_name}} as a non-exclusive sales agent to market and source customer enquiries for solar solutions within {{territory}}." },
      { heading: "2. Term", body: "This Agreement is effective from {{effective_date}} for a period of {{term_years}} year(s), and may be renewed in writing." },
      { heading: "3. Scope of Services", body: "The Agent shall (a) generate leads, (b) facilitate site surveys, (c) assist in customer documentation, and (d) coordinate with the Principal's project team until handover. The Agent shall not sign contracts, collect payments, or make commitments on behalf of the Principal without prior written authority." },
      { heading: "4. Commission", body: "The Principal shall pay the Agent a commission of {{commission_pct}}% on the Net Order Value (excluding GST and third-party pass-through costs) of every project successfully booked, executed, and paid for through the Agent's introduction. Payout: {{payout_terms}}" },
      { heading: "5. Independent Contractor", body: "The Agent is an independent contractor and not an employee, partner, or joint-venture partner of the Principal. The Agent shall bear all its own costs, taxes, and statutory obligations." },
      { heading: "6. Code of Conduct", body: "The Agent shall not misrepresent product specifications, pricing, warranties, or timelines, and shall comply with the Principal's brand guidelines and ethics policy at all times." },
      { heading: "7. Confidentiality", body: "The Agent shall keep confidential all customer data, pricing, and commercial information, both during and for two (2) years after this engagement." },
      { heading: "8. Termination", body: "Either party may terminate with thirty (30) days written notice. Commissions accrued on projects already invoiced shall survive termination." },
      { heading: "9. Governing Law", body: "Governed by Indian law; courts at {{place}} shall have exclusive jurisdiction." },
    ],
  },
  {
    slug: "b2b",
    title: "B2B Agreement",
    short: "B2B",
    description: "Master services / supply agreement between Unite Solar and a corporate customer.",
    hue: "from-indigo-600 to-blue-400",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Customer"),
      { key: "scope", label: "Scope of Supply / Services", type: "textarea", placeholder: "EPC of XX kWp rooftop solar plant, O&M, etc." },
      { key: "contract_value", label: "Total Contract Value (INR)", type: "number" },
      { key: "payment_schedule", label: "Payment Schedule", type: "textarea", default: "10% Advance against PO, 70% on Material ready to dispatch, 15% Pre-installation, 5% Post-installation/Commissioning." },
      { key: "delivery_weeks", label: "Delivery Timeline (weeks)", type: "number", default: "10" },
      { key: "warranty", label: "Warranty Terms", type: "textarea", default: "Modules: 12 yr product / 25 yr performance (mfr). Inverters: 5 yr (mfr). Workmanship: 5 yr from commissioning." },
    ],
    sections: [
      { heading: "1. Scope", body: "{{company_name}} shall supply, install, and commission the following for {{party_name}}: {{scope}}." },
      { heading: "2. Contract Value", body: "The total contract value is INR {{contract_value}} (inclusive of applicable taxes unless stated otherwise in the Bill of Quantities)." },
      { heading: "3. Payment Schedule", body: "Payments shall be released as per the following milestones: {{payment_schedule}}. All invoices are payable within seven (7) days of milestone certification." },
      { heading: "4. Delivery & Commissioning", body: "Subject to site readiness and timely payments, the project shall be commissioned within {{delivery_weeks}} weeks from the date of advance receipt and signed PO." },
      { heading: "5. Warranties", body: "{{warranty}} Pass-through manufacturer warranties shall be assigned to the Customer post-commissioning." },
      { heading: "6. Customer Obligations", body: "The Customer shall provide a clear, structurally sound site, three-phase grid connection, water and power for installation, statutory approvals, and unhindered access during execution." },
      { heading: "7. Liquidated Damages & Limit of Liability", body: "Delay LD: 0.5% of delayed scope value per completed week, capped at 5% of contract value. Aggregate liability of either party shall not exceed the contract value." },
      { heading: "8. Confidentiality, IP & Data", body: "Each party shall protect the other's confidential information for three (3) years post-termination. Background IP remains with its owner." },
      { heading: "9. Force Majeure", body: "Neither party shall be liable for delays caused by events beyond reasonable control, including acts of God, government action, strikes, pandemics, or grid unavailability." },
      { heading: "10. Governing Law & Dispute Resolution", body: "This Agreement is governed by Indian law. Disputes shall be resolved by arbitration (sole arbitrator) seated at {{place}} under the Arbitration and Conciliation Act, 1996." },
    ],
  },
  {
    slug: "epc-vendor",
    title: "EPC Vendor Agreement",
    short: "EPC Vendor",
    description: "Engage an EPC sub-contractor / installation partner for project execution.",
    hue: "from-emerald-500 to-teal-400",
    image: "https://images.unsplash.com/photo-1566669437687-7040a6926753?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Vendor"),
      { key: "project_scope", label: "Project Scope / Site", type: "textarea" },
      { key: "capacity_kwp", label: "Capacity (kWp)", type: "number" },
      { key: "vendor_value", label: "Vendor Contract Value (INR)", type: "number" },
      { key: "rate_per_wp", label: "Rate (INR per Wp installed)", type: "number" },
      { key: "execution_weeks", label: "Execution Window (weeks)", type: "number", default: "6" },
      { key: "ld_pct", label: "Liquidated Damages (% per week)", type: "number", default: "0.5" },
    ],
    sections: [
      { heading: "1. Engagement", body: "{{company_name}} (\"EPC Owner\") hereby engages {{party_name}} (\"Vendor\") as an installation sub-contractor for the following project: {{project_scope}}, of capacity {{capacity_kwp}} kWp." },
      { heading: "2. Scope of Work", body: "Vendor shall undertake civil/structural works, mechanical mounting, electrical installation, earthing, lightning protection, cable laying, inverter and ACDB/DCDB installation, testing, and assistance in commissioning, strictly per approved drawings, BOQ, and IS/IEC standards." },
      { heading: "3. Contract Value & Rate", body: "Total vendor contract value: INR {{vendor_value}} at an indicative rate of INR {{rate_per_wp}} per Wp installed. Variations require prior written approval." },
      { heading: "4. Timeline", body: "Vendor shall complete works within {{execution_weeks}} weeks from site handover. Weekly progress reports with photographs are mandatory." },
      { heading: "5. Quality & Safety", body: "Vendor shall comply with EPC Owner's HSE policy, deploy trained manpower, use only approved make BOM items, and rectify snags identified during pre-commissioning at no extra cost." },
      { heading: "6. Payment Terms", body: "10% mobilisation advance against bank guarantee; 70% on material at site / structure erected; 15% on mechanical & electrical completion; 5% retention released after Defect Liability Period of 12 months." },
      { heading: "7. Liquidated Damages", body: "For delays attributable to the Vendor, LD of {{ld_pct}}% of delayed scope value per completed week shall apply, capped at 7.5% of the vendor contract value." },
      { heading: "8. Insurance & Indemnity", body: "Vendor shall maintain Workmen's Compensation, CAR/EAR, and Third-Party Liability insurance for the project duration, and indemnify the EPC Owner against claims arising from Vendor's acts or omissions." },
      { heading: "9. Confidentiality & Non-Solicit", body: "Vendor shall not approach the end-customer for any solar work, directly or indirectly, for two (2) years after project handover." },
      { heading: "10. Governing Law", body: "Governed by Indian law; arbitration seated at {{place}}." },
    ],
  },
  {
    slug: "manufacturer",
    title: "Manufacturer Agreement",
    short: "Manufacturer",
    description: "Supply agreement with module / inverter / BOS manufacturer or OEM partner.",
    hue: "from-violet-600 to-fuchsia-400",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Manufacturer"),
      { key: "products", label: "Product(s) Covered", type: "textarea", placeholder: "e.g. Mono PERC 550Wp modules, string inverters" },
      { key: "annual_volume", label: "Indicative Annual Volume", type: "text", placeholder: "e.g. 10 MWp" },
      { key: "price_basis", label: "Price Basis", type: "textarea", default: "Ex-works, INR per Wp; quarterly price revision linked to polysilicon index." },
      { key: "warranty", label: "Warranty", type: "textarea", default: "12 yr product warranty, 25 yr linear performance warranty (≥84.8% at year 25)." },
      { key: "credit_days", label: "Credit Period (days)", type: "number", default: "30" },
    ],
    sections: [
      { heading: "1. Appointment", body: "{{party_name}} (\"Manufacturer\") shall supply {{company_name}} (\"Buyer\") with {{products}} on a non-exclusive, preferred-supplier basis." },
      { heading: "2. Indicative Volume", body: "The parties target an indicative annual offtake of {{annual_volume}}, subject to firm purchase orders issued by the Buyer from time to time." },
      { heading: "3. Pricing", body: "Pricing basis: {{price_basis}}. All prices exclude GST, freight, and insurance unless expressly included on the PO." },
      { heading: "4. Quality, Certifications & BIS", body: "All products shall comply with applicable IS/IEC/BIS standards (incl. ALMM where applicable), and the Manufacturer shall furnish factory test reports, batch numbers, and serial-number lists for each shipment." },
      { heading: "5. Warranty", body: "{{warranty}} Warranty claims shall be honoured at the project site, with replacement modules dispatched within thirty (30) days of claim acceptance." },
      { heading: "6. Payment", body: "Payment terms: Net {{credit_days}} days from invoice date, against satisfactory inspection at the Buyer's warehouse / project site." },
      { heading: "7. Inspection & Rejection", body: "The Buyer or its representative may inspect goods pre-dispatch (PDI). Goods not conforming to specs shall be rejected, and the Manufacturer shall replace such goods at its cost within fifteen (15) days." },
      { heading: "8. Delivery & Risk", body: "Delivery as per agreed Incoterm on each PO. Title transfers on payment; risk transfers on delivery to the named place." },
      { heading: "9. Brand & Co-Marketing", body: "The Manufacturer shall support joint marketing initiatives, reference site visits, and provide brand-compliant collateral for the Buyer's projects." },
      { heading: "10. Governing Law", body: "Indian law; jurisdiction at {{place}}." },
    ],
  },
  {
    slug: "financial-consultant",
    title: "Financial Consultant Agreement",
    short: "Financial Consultant",
    description: "Engage a financial consultant for solar project financing, loan tie-ups, and investor introductions.",
    hue: "from-amber-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=70",
    fields: [
      ...COMPANY_FIELDS,
      ...COUNTERPARTY("Consultant"),
      { key: "services", label: "Scope of Financial Services", type: "textarea", default: "Loan syndication, lender introductions, financial modelling, investor decks, debt-structuring advisory." },
      { key: "term_months", label: "Engagement Term (months)", type: "number", default: "12" },
      { key: "retainer", label: "Monthly Retainer (INR)", type: "number" },
      { key: "success_fee_pct", label: "Success Fee (% of debt raised)", type: "number", default: "1" },
      { key: "exclusivity", label: "Exclusivity", type: "text", default: "Non-exclusive" },
    ],
    sections: [
      { heading: "1. Engagement", body: "{{company_name}} (\"Client\") hereby engages {{party_name}} (\"Consultant\") on a {{exclusivity}} basis to provide the following services: {{services}}." },
      { heading: "2. Term", body: "This engagement shall be effective from {{effective_date}} and continue for {{term_months}} months unless terminated earlier in accordance with this Agreement." },
      { heading: "3. Fees", body: "Client shall pay (a) a monthly retainer of INR {{retainer}}, payable within seven (7) days of invoice, and (b) a success fee of {{success_fee_pct}}% of debt / equity successfully raised through the Consultant's direct introduction, payable within fifteen (15) days of disbursement." },
      { heading: "4. Reimbursables", body: "Pre-approved out-of-pocket expenses (travel, lender processing, valuation, legal opinions) shall be reimbursed at actuals against supporting documents." },
      { heading: "5. Standard of Care", body: "Consultant shall perform services with reasonable skill and care, in compliance with all applicable laws, including SEBI / RBI regulations as relevant." },
      { heading: "6. Confidentiality", body: "Consultant shall treat the Client's financials, strategy, and project details as strictly confidential, and shall not disclose them to third parties without the Client's prior written consent." },
      { heading: "7. Conflict of Interest", body: "Consultant shall promptly disclose any actual or potential conflict of interest and shall not represent competing solar developers in the same lender pool without consent." },
      { heading: "8. Limitation of Liability", body: "Consultant's aggregate liability shall not exceed the fees actually received from the Client in the preceding six (6) months." },
      { heading: "9. Termination", body: "Either party may terminate with thirty (30) days written notice. Success fees on transactions already mandated and signed shall survive termination." },
      { heading: "10. Governing Law", body: "Governed by Indian law; courts at {{place}} shall have exclusive jurisdiction." },
    ],
  },
];

export const getAgreement = (slug: string) =>
  AGREEMENTS.find((a) => a.slug === slug);

export const fillTemplate = (text: string, values: Record<string, string>) =>
  text.replace(/\{\{(\w+)\}\}/g, (_m, k) => {
    const v = values[k];
    if (v === undefined || v === "") return `__________`;
    return v;
  });

export const formatDate = (d: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

export const formatValue = (field: AgreementField, raw: string) => {
  if (!raw) return "";
  if (field.type === "date") return formatDate(raw);
  if (field.type === "number") {
    const n = Number(raw);
    if (!isFinite(n)) return raw;
    return n.toLocaleString("en-IN");
  }
  return raw;
};