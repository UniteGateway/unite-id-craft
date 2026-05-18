export type LetterCategory =
  | "government"
  | "industries"
  | "institutions"
  | "corporates";

export interface LetterTemplate {
  id: string;
  name: string;
  category: LetterCategory;
  subject: string;
  /** Body content. Supports {date}, {to_name}, {to_designation}, {to_org}, {to_address}, {sender_name}, {sender_designation} */
  body: string;
}

export interface LetterCategoryDef {
  key: LetterCategory;
  title: string;
  short: string;
  description: string;
  hue: string;
  image: string;
}

export const LETTER_CATEGORIES: LetterCategoryDef[] = [
  {
    key: "government",
    title: "Government Officials",
    short: "Government",
    description: "Introduction letters to MNRE, DISCOMs, ministries, district & municipal authorities.",
    hue: "from-emerald-600 to-teal-400",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=70",
  },
  {
    key: "industries",
    title: "Industries",
    short: "Industries",
    description: "Manufacturing units, factories and industrial parks for rooftop / open-access solar.",
    hue: "from-orange-500 to-amber-400",
    image: "https://images.unsplash.com/photo-1581091012184-7d7e1f9e6a30?auto=format&fit=crop&w=800&q=70",
  },
  {
    key: "institutions",
    title: "Institutions",
    short: "Institutions",
    description: "Schools, colleges, universities, hospitals and NGOs for campus solarisation.",
    hue: "from-indigo-600 to-blue-400",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=70",
  },
  {
    key: "corporates",
    title: "Corporates",
    short: "Corporates",
    description: "IT parks, BFSI, retail chains, hotels and large corporate offices for C&I solar.",
    hue: "from-violet-600 to-fuchsia-400",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
  },
];

const SIGN_OFF = `We would be glad to schedule a brief meeting at your convenience to present our credentials, past projects and a preliminary techno-commercial outline tailored to your requirement.

Thanking you and assuring you of our best services at all times.

Yours sincerely,

{sender_name}
{sender_designation}
Unite Solar (Unite Developers Global Inc.)
M: +91-__________  |  E: info@unitesolar.in`;

export const LETTER_TEMPLATES: LetterTemplate[] = [
  // GOVERNMENT
  {
    id: "gov-intro",
    category: "government",
    name: "General Introduction – Government Office",
    subject: "Introduction – Unite Solar – Empanelled EPC & Rooftop Solar Developer",
    body: `Respected {to_name},

Sub: Introduction of M/s Unite Solar (Unite Developers Global Inc.) as a Solar EPC & Rooftop Developer.

At the outset, we take this opportunity to introduce M/s Unite Solar, a unit of Unite Developers Global Inc., headquartered at Banjara Hills, Hyderabad. We are a full-service solar EPC company engaged in the design, supply, installation and O&M of grid-connected rooftop, ground-mounted and open-access solar PV plants across India.

Our team brings together more than a decade of cumulative experience across utility-scale and distributed solar projects, with active engagements in Telangana, Andhra Pradesh, Karnataka and Maharashtra. We work strictly in compliance with MNRE, BIS/IEC standards and the respective State DISCOM net-/gross-metering regulations.

In line with the Government of India's vision of 500 GW of non-fossil capacity by 2030 and the PM Surya Ghar: Muft Bijli Yojana, we are keen to associate with the {to_org} for:

• Solarisation of government buildings, offices and public institutions
• Awareness & beneficiary mobilisation under PM Surya Ghar
• Empanelment as Vendor / EPC partner under State Nodal Agency programs
• Technical advisory and feasibility studies for departmental projects

${SIGN_OFF}`,
  },
  {
    id: "gov-discom",
    category: "government",
    name: "DISCOM Empanelment Request",
    subject: "Request for Empanelment as Rooftop Solar Vendor",
    body: `Respected {to_name},

Sub: Application for Empanelment of M/s Unite Solar as a Rooftop Solar PV Installer with {to_org}.

We refer to the empanelment guidelines issued by {to_org} for vendors executing grid-connected rooftop solar PV systems under the PM Surya Ghar / State Rooftop Programme.

M/s Unite Solar (Unite Developers Global Inc.) is a Hyderabad-based solar EPC company with an installed and commissioned base of rooftop and ground-mounted solar PV plants. We have in-house design, procurement, installation and O&M capabilities and use only ALMM-listed modules and BIS-certified inverters.

We hereby request your good office to consider our application for empanelment. The required documentation (GST, PAN, MSME, ISO, technical credentials, audited financials, executed project list, manpower & tools list) is enclosed / shall be submitted as per your prescribed format.

${SIGN_OFF}`,
  },

  // INDUSTRIES
  {
    id: "ind-rooftop",
    category: "industries",
    name: "Industrial Rooftop Solar Proposal",
    subject: "Reduce your Energy Bill by up to 40% with Rooftop Solar",
    body: `Dear {to_name},

Sub: Rooftop Solar PV Solution for {to_org} – Indicative Proposal.

Industries today are under continuous pressure to reduce energy cost, achieve Scope-2 decarbonisation and meet customer / lender ESG expectations. A behind-the-meter rooftop solar PV plant is one of the fastest and most predictable levers available to your CFO and Plant Head.

M/s Unite Solar (Unite Developers Global Inc.), a Hyderabad-headquartered solar EPC company, is pleased to introduce our Industrial Rooftop Solar offering for {to_org}:

• Plant capacity: customised between 100 kWp – 5 MWp on factory shed
• Modules: ALMM-listed Mono-PERC / TOPCon, 12 yr product + 25 yr performance warranty
• Inverters: Tier-1 string inverters with 5 yr OEM warranty
• Commercial models: CAPEX, OPEX (zero-investment PPA) or hybrid
• Tariff savings: typically 25%–40% on landed cost of grid power
• Payback: 3.5 – 4.5 years on CAPEX; immediate savings on OPEX
• Free 25-yr remote monitoring + 5 yr comprehensive O&M

Subject to a brief site visit, we shall be glad to share a detailed techno-commercial proposal with structural feasibility, single-line diagram, generation estimate, savings analysis and ROI for {to_org}.

${SIGN_OFF}`,
  },

  // INSTITUTIONS
  {
    id: "inst-campus",
    category: "institutions",
    name: "Campus Solarisation – Schools / Colleges",
    subject: "Solarise your Campus – Save Energy Cost & Inspire your Students",
    body: `Respected {to_name},

Sub: Proposal for Grid-Connected Rooftop Solar PV Plant at {to_org}.

Educational and healthcare institutions today bear a significant recurring expenditure on grid electricity. A grid-connected rooftop solar PV plant not only reduces this expenditure by 25%–40%, but also serves as a living laboratory for sustainability for your students, staff and visitors.

M/s Unite Solar (Unite Developers Global Inc.), Hyderabad, is pleased to offer a turnkey campus solarisation solution to {to_org}:

• Detailed shadow analysis & generation estimate, free of cost
• Rooftop or ground-mounted PV plant, designed for safety on student-occupied buildings
• ALMM-listed modules, BIS-certified inverters, IEC-compliant BOM
• Net-/gross-metering coordination with the State DISCOM
• CAPEX / RESCO (OPEX) / Hybrid commercial models
• Free LMS / signage support to display real-time generation to students
• 5-year comprehensive O&M and 25-year remote monitoring

We shall be pleased to depute our team for a no-obligation site visit and submit a detailed proposal for the kind consideration of {to_org}.

${SIGN_OFF}`,
  },

  // CORPORATES
  {
    id: "corp-c-and-i",
    category: "corporates",
    name: "C&I Solar – Corporate Office / IT Park",
    subject: "Decarbonise your Operations with On-site & Open-access Solar",
    body: `Dear {to_name},

Sub: Solar PV & Open-access Power Solution for {to_org}.

Leading corporates today are committed to RE100, science-based targets and net-zero pathways. Achieving these goals at scale requires a blended strategy of on-site rooftop solar, off-site open-access solar / wind-solar hybrid and corporate PPAs.

M/s Unite Solar (Unite Developers Global Inc.), Hyderabad, partners with corporates across BFSI, IT/ITeS, retail, hospitality and large commercial real estate to deliver:

• On-site rooftop solar PV plants (CAPEX / OPEX) up to 5 MWp per site
• Open-access solar / hybrid PPAs across Telangana, Karnataka, Maharashtra, Tamil Nadu, Gujarat
• Battery Energy Storage (BESS) for peak shaving and resilience
• EV charging infrastructure integration
• Carbon-accounting & Scope-2 reporting support
• Single-window EPC, financing tie-ups and 25-yr O&M

We would value the opportunity to introduce our credentials, reference customers and indicative tariff to the Energy / Sustainability / Admin leadership at {to_org}.

${SIGN_OFF}`,
  },
];

export const getTemplatesByCategory = (cat: LetterCategory) =>
  LETTER_TEMPLATES.filter((t) => t.category === cat);

export const getCategory = (key: string) =>
  LETTER_CATEGORIES.find((c) => c.key === key);

export const fillLetter = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_m, k) => {
    const v = values[k];
    if (v === undefined || v === "") return `__________`;
    return v;
  });

export const formatLetterDate = (d: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};