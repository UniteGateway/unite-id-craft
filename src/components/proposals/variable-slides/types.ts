export interface ProposalVars {
  PROJECT_NAME: string;
  LOCATION: string;
  CAPACITY: string;        // "1"  (MW assumed)
  PROJECT_COST: string;    // in Cr
  TOTAL_SAVINGS: string;   // in Cr
  PAYBACK: string;         // in years
  ANNUAL_UNITS: string;    // in Lakh Units
  OM_COST: string;         // in Lakhs/year
  CO2: string;             // tons/year
  LIFE: string;            // years
}

export const DEFAULT_VARS: ProposalVars = {
  PROJECT_NAME: "SMR Vinay Iconia",
  LOCATION: "Gachibowli / Kondapur",
  CAPACITY: "1",
  PROJECT_COST: "4.2",
  TOTAL_SAVINGS: "18",
  PAYBACK: "4.5",
  ANNUAL_UNITS: "15",
  OM_COST: "3.5",
  CO2: "1200",
  LIFE: "25",
};

export const VAR_LABELS: Record<keyof ProposalVars, string> = {
  PROJECT_NAME: "Project Name",
  LOCATION: "Location",
  CAPACITY: "Capacity (MW)",
  PROJECT_COST: "Project Cost (₹ Cr)",
  TOTAL_SAVINGS: "Total Savings (₹ Cr)",
  PAYBACK: "Payback (Years)",
  ANNUAL_UNITS: "Annual Units (Lakh)",
  OM_COST: "O&M Cost (₹ Lakhs/yr)",
  CO2: "CO₂ Reduced (Tons/yr)",
  LIFE: "Project Life (Years)",
};