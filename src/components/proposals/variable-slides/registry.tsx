import React from "react";
import CoverSlide from "./CoverSlide";
import OverviewSlide from "./OverviewSlide";
import SiteSlide from "./SiteSlide";
import TechnicalSlide from "./TechnicalSlide";
import LayoutSlide from "./LayoutSlide";
import GenerationSlide from "./GenerationSlide";
import { ProposalVars } from "./types";

export interface VariableSlideDef {
  n: number;
  key: string;
  title: string;
  Component: React.ForwardRefExoticComponent<
    { vars: ProposalVars } & React.RefAttributes<HTMLDivElement>
  > | null;
}

export const VARIABLE_SLIDE_REGISTRY: VariableSlideDef[] = [
  { n: 10, key: "cover", title: "Cover Page", Component: CoverSlide },
  { n: 11, key: "overview", title: "Project Overview", Component: OverviewSlide },
  { n: 12, key: "site", title: "Site & Location Analysis", Component: SiteSlide },
  { n: 13, key: "technical", title: "Technical Overview", Component: TechnicalSlide },
  { n: 14, key: "layout", title: "System Layout", Component: LayoutSlide },
  { n: 15, key: "generation", title: "Energy Generation Analysis", Component: GenerationSlide },
  { n: 16, key: "savings", title: "Savings Potential", Component: null },
  { n: 17, key: "roi", title: "ROI & Financial Analysis", Component: null },
  { n: 18, key: "feasibility", title: "Feasibility Report", Component: null },
  { n: 19, key: "timeline", title: "Implementation Timeline", Component: null },
];