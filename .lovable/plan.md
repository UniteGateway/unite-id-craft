## Goal

Create a unified **Admin Hub** dashboard that surfaces every admin-managed resource in one place. No new CRUD logic — it links into the existing managers already implemented in `src/pages/Admin.tsx` and `src/components/admin/*`.

## What gets built

### 1. New route `/admin/hub` (admin-only)
- Guarded by `useUserRole().isAdmin` — non-admins redirected to `/home`.
- Wrapped in `AppNav` for consistency with `Admin.tsx`.

### 2. Hub layout
A responsive grid of cards, each linking to a section of the existing Admin page (using URL hash anchors, e.g. `/admin#fixed-slides`):

| Card | Description | Target |
|---|---|---|
| Fixed Slides | Manage About / Credentials / CTA slides | `#fixed-slides` |
| Brand Assets | Logos & images library | `#brand-assets` |
| Brand Palettes | Color palettes for templates | `#palettes` |
| Residential Presets | 1–10 kW preset configurations | `#residential-presets` |
| Residential Offers | Active discount/freebie offers | `#residential-offers` |
| Proposal Settings | Warranties, AMC, general T&C | `#proposal-settings` |
| Design Templates | ID / Visiting / Social templates | `/designs/id` etc. |
| API Keys | OpenAI / Gemini credentials | `#api-keys` |
| Users & Roles | Grant/revoke admin | `#users` |

Each card shows: icon, title, one-line description, live count badge (e.g. "12 fixed slides"), and an "Open" button.

### 3. Live counts (top stats strip)
Four `StatCard`s at the top:
- Total Proposals (sum of `proposals` + `community_proposals` + `residential_proposals` + `solar_proposals`)
- Brand Assets count
- Active Fixed Slides count
- Admin Users count

All fetched in parallel via `supabase.from(...).select('id', { count: 'exact', head: true })`.

### 4. Recent Activity panel
Show the 10 most recent rows across `brand_assets`, `fixed_slides`, `design_templates`, and `solar_proposals` (created_at desc, merged client-side), each with type badge + name + relative time + "Open" link.

### 5. Light wiring on existing Admin page
Add `id="..."` anchors to each section in `src/pages/Admin.tsx` so hash links from the hub scroll/jump correctly. No logic changes.

### 6. Sidebar / nav entry
Add an "Admin Hub" link in `AppNav.tsx` for admins (next to existing Admin link), pointing at `/admin/hub`. Existing `/admin` route stays as the deep CRUD page.

## Files

**New**
- `src/pages/AdminHub.tsx` — the dashboard

**Edited**
- `src/App.tsx` — register `/admin/hub` route (ProtectedRoute)
- `src/pages/Admin.tsx` — add anchor `id`s to existing section wrappers
- `src/components/AppNav.tsx` — add Admin Hub nav link for admins

## Out of scope (for this slice)
- New CRUD screens or bulk uploads
- Techno-Commercial proposal generator (will be a separate slice)
- Per-resource detail pages — hub links into existing managers