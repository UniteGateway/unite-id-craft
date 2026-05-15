export interface ProposalVars {
  PROJECT_NAME: string;
  LOCATION: string;
  CAPACITY: string;        // MW
  PROJECT_COST: string;    // Cr
  TOTAL_SAVINGS: string;   // Cr (lifetime, computed if blank)
  PAYBACK: string;         // years
  ANNUAL_UNITS: string;    // Lakh kWh
  OM_COST: string;         // Lakhs/yr
  CO2: string;             // tons/yr
  LIFE: string;            // years
  // Site
  LATITUDE: string;        // decimal °
  LONGITUDE: string;       // decimal °
  ROOF_AREA_SQM: string;   // m²
  TILT: string;            // °
  // Shading + financial inputs
  SHADING_LOSS_PCT: string;
  TARIFF: string;            // ₹/kWh
  ESCALATION_PCT: string;    // %/yr
  DEGRADATION_PCT: string;   // %/yr
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
  LATITUDE: "17.45",
  LONGITUDE: "78.38",
  ROOF_AREA_SQM: "8000",
  TILT: "17",
  SHADING_LOSS_PCT: "3",
  TARIFF: "8",
  ESCALATION_PCT: "5",
  DEGRADATION_PCT: "0.7",
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
  LATITUDE: "Latitude (°)",
  LONGITUDE: "Longitude (°)",
  ROOF_AREA_SQM: "Roof / Available Area (m²)",
  TILT: "Tilt (°)",
  SHADING_LOSS_PCT: "Shading Loss (%)",
  TARIFF: "Tariff (₹/kWh)",
  ESCALATION_PCT: "Tariff Escalation (%/yr)",
  DEGRADATION_PCT: "Module Degradation (%/yr)",
};
