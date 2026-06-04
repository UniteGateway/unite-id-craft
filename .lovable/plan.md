## Phase 2 — Lead → Bill OCR → Feasibility → Design → Quote

Builds the customer-facing funnel on top of the Phase 1 pricing core. Every step writes to one `leads` record, so the final quotation auto-fills with real site numbers instead of manual entry.

### 1. Lead capture (Module 1)
- New table `leads`: name, phone, email, segment (Residential / Commercial / Industrial / Captive / OA), state, city, address, sanction_load_kw, monthly_bill_inr, avg_units_kwh, roof_area_sqm, roof_type (RCC / Metal / Ground), shadow_free_pct, source, owner_id, status (new → feasibility → design → quoted → won/lost), created_at.
- New page `/leads` — list + filters + status pipeline.
- New page `/leads/new` — create form (also embeddable as a public capture form later).
- New page `/leads/:id` — single lead workspace with tabs: **Overview · Bill · Feasibility · Design · Quote**.

### 2. Bill OCR (Module 2)
- New edge function `extract-power-bill` (uses Lovable AI `google/gemini-2.5-flash` with image input).
- Upload bill image/PDF → returns: discom, consumer_no, tariff_category, sanction_load_kw, contract_demand_kva, monthly_units_kwh (last 6 months array), avg_monthly_bill_inr, tariff_slab_inr_per_kwh, fixed_charges_inr.
- Stored on the lead; one-click "Apply to lead".
- New storage bucket `power-bills` (private, owner-only RLS).

### 3. Feasibility engine (Module 3)
- Pure TS module `src/lib/feasibility-engine.ts` consuming lead + bill data:
  - **Recommended size (kW)** = min(roof-area-capacity, load-based-capacity, 500 kW state cap when net-metering).
  - **Net-metering eligibility** per state (reuses `price_state_policies`).
  - **BTM / Zero-export split** when load > 500 kW: NM = 500, BTM = balance ≤ 50% of avg consumption.
  - **Annual generation** via `solar-irradiance.ts` (already exists).
  - **CO₂, payback, IRR** via `solar-financials.ts` (already exists).
- Tab in lead workspace renders the existing `FeasibilityNetMeteringSections` component with these numbers pre-filled (no manual entry).
- "Promote to formal Feasibility Report" button → creates a `covering_letters` + feasibility record (reuses existing flow).

### 4. Design engine (Module 4)
- Pure TS module `src/lib/design-engine.ts`:
  - Module pick = highest-Wp panel in `price_modules` matching budget tier.
  - Inverter pick = closest match to recommended kW with DC/AC ratio 1.15–1.25 from `price_inverters`.
  - Structure pick = matches roof_type from `price_structures`.
  - String sizing: panels/string from inverter MPPT range; strings/MPPT from current limits.
  - BOQ = modules + inverters + structure + BOS (cable lengths estimated from roof area).
- Design tab shows: equipment list, string config diagram (SVG), one-line BOQ table.
- "Send to Quote" → opens `QuotationBuilder` with everything pre-populated; user only confirms margin.

### 5. Wiring it all together
- `QuotationBuilder` accepts `?leadId=` query param and hydrates customer + capacity + selected SKUs.
- Lead status auto-advances on each step.
- Dashboard tile: "Lead Pipeline" with counts per status.

### Technical notes (skip if non-technical)
- New files: `src/pages/leads/*` (List, New, Detail), `src/lib/feasibility-engine.ts`, `src/lib/design-engine.ts`, `supabase/functions/extract-power-bill/index.ts` (already exists — extend it), migration for `leads` + `power-bills` bucket.
- Reuses: `pricing.ts`, `solar-financials.ts`, `solar-irradiance.ts`, `FeasibilityNetMeteringSections.tsx`, `QuotationBuilder.tsx`, `price_*` tables.
- AI: Lovable AI Gateway `google/gemini-2.5-flash` for bill OCR (vision-capable, no extra key).

### Out of scope for Phase 2 (call out)
- Site Survey AI with photo/video complexity scoring → Phase 4.
- EMI / finance partner integration → Phase 3.
- Public lead-capture landing form (kept internal for now).

Confirm and I'll build it. If you want to drop any of the four modules, say which.