import React from "react";
import { BoqLine, ResidentialComputed, FinanceComputed, inr } from "@/lib/residential-presets";
import logoUrl from "@/assets/unite-solar-logo.png";

type Props = {
  title: string;
  proposalNumber?: string | null;
  client: { name?: string; location?: string; contact?: string; email?: string };
  capacityKw: number;
  panelCount: number;
  panelWattage: number;
  inverterCapacity: number;
  structureType: string;
  boq: BoqLine[];
  terms: string;
  computed: ResidentialComputed;
  coverUrl?: string | null;
  category?: string;
  finance?: FinanceComputed;
  paymentMode?: "cash" | "loan" | string;
  loanInterestRate?: number;
  loanTenureYears?: number;
  subsidyInLoan?: boolean;
  offerLabel?: string | null;
  offerDescription?: string | null;
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="pdf-page bg-white text-slate-900 mx-auto shadow-lg"
    style={{ width: "210mm", minHeight: "297mm", padding: "16mm", boxSizing: "border-box" }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ small?: boolean }> = ({ small }) => (
  <div className="flex items-center gap-2">
    <img src={logoUrl} alt="Unite Solar" style={{ height: small ? 28 : 44 }} crossOrigin="anonymous" />
    <div className="leading-tight">
      <div className={small ? "text-sm font-bold" : "text-lg font-extrabold"} style={{ color: "#1a3c6e" }}>
        Unite Solar
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">Powered by Unite Developers Global Inc</div>
    </div>
  </div>
);

const ResidentialDocument: React.FC<Props> = (props) => {
  const { title, proposalNumber, client, capacityKw, panelCount, panelWattage, inverterCapacity, structureType, boq, terms, computed, coverUrl,
    category, finance, paymentMode, loanInterestRate, loanTenureYears, subsidyInLoan, offerLabel, offerDescription } = props;

  return (
    <div id="proposal-doc" className="space-y-6">
      {/* COVER */}
      <Page>
        <div
          className="relative w-full h-full rounded-md overflow-hidden flex flex-col justify-between"
          style={{
            minHeight: "265mm",
            backgroundImage: coverUrl ? `url(${coverUrl})` : "linear-gradient(135deg, #1a3c6e, #f08c00)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.75) 100%)" }} />
          <div className="relative p-6 flex items-center justify-between text-white">
            <Logo />
            <div className="text-right text-xs opacity-90">
              {proposalNumber && <div>Proposal #: {proposalNumber}</div>}
              <div>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>
          <div className="relative p-8 text-white">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold mb-4">RESIDENTIAL SOLAR PROPOSAL</div>
            <h1 className="text-5xl font-extrabold leading-tight drop-shadow-lg">{title || `${capacityKw} kW Solar Solution`}</h1>
            <p className="mt-3 text-lg opacity-95">Prepared for <span className="font-bold">{client.name || "—"}</span></p>
            <p className="text-sm opacity-90">{client.location || ""}</p>
          </div>
        </div>
      </Page>

      {/* OVERVIEW */}
      <Page>
        <div className="flex items-center justify-between border-b-2 pb-3 mb-6" style={{ borderColor: "#f08c00" }}>
          <Logo small />
          <div className="text-xs text-slate-500">Project Overview</div>
        </div>
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Project Overview</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded border border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold">Client Details</div>
            <div className="text-sm space-y-1">
              <div><b>Name:</b> {client.name || "—"}</div>
              <div><b>Location:</b> {client.location || "—"}</div>
              <div><b>Contact:</b> {client.contact || "—"}</div>
              <div><b>Email:</b> {client.email || "—"}</div>
            </div>
          </div>
          <div className="p-4 rounded border border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold">System Specs</div>
            <div className="text-sm space-y-1">
              <div><b>Capacity:</b> {capacityKw} kW</div>
              <div><b>Modules:</b> {panelCount} × {panelWattage} Wp</div>
              <div><b>Inverter:</b> {inverterCapacity} kW</div>
              <div><b>Structure:</b> {structureType}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded text-white" style={{ background: "#1a3c6e" }}>
            <div className="text-xs opacity-90">System Subtotal</div>
            <div className="text-xl font-extrabold">{inr(computed.boqSubtotal)}</div>
          </div>
          <div className="p-4 rounded text-white" style={{ background: "#3a3a3a" }}>
            <div className="text-xs opacity-90">GST (Blended)</div>
            <div className="text-xl font-extrabold">{inr(computed.gstTotal)}</div>
          </div>
          <div className="p-4 rounded text-white" style={{ background: "#f08c00" }}>
            <div className="text-xs opacity-90">Total Investment</div>
            <div className="text-xl font-extrabold">{inr(computed.totalCost)}</div>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed">
          This proposal covers the design, supply, installation and commissioning of a {capacityKw} kW grid-connected residential rooftop solar system. The system is designed for maximum generation with Tier-1 components, in compliance with MNRE & local DISCOM standards.
        </div>
      </Page>

      {/* BOQ */}
      <Page>
        <div className="flex items-center justify-between border-b-2 pb-3 mb-6" style={{ borderColor: "#f08c00" }}>
          <Logo small />
          <div className="text-xs text-slate-500">Bill of Quantities</div>
        </div>
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Bill of Quantities</h2>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: "#1a3c6e", color: "white" }}>
              <th className="text-left p-2 w-8">#</th>
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2 w-16">Qty</th>
              <th className="text-left p-2 w-16">Unit</th>
              <th className="text-right p-2 w-24">Rate (₹)</th>
              <th className="text-right p-2 w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {boq.map((l, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{l.item}</td>
                <td className="p-2 text-right">{l.qty}</td>
                <td className="p-2">{l.unit}</td>
                <td className="p-2 text-right">{Math.round(l.rate).toLocaleString("en-IN")}</td>
                <td className="p-2 text-right">{Math.round(l.amount).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={5} className="p-2 text-right">Subtotal</td>
              <td className="p-2 text-right">{inr(computed.boqSubtotal)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="p-2 text-right">GST @ 5% (Goods 70%)</td>
              <td className="p-2 text-right">{inr(computed.gst5)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="p-2 text-right">GST @ 18% (Services 30%)</td>
              <td className="p-2 text-right">{inr(computed.gst18)}</td>
            </tr>
            <tr style={{ background: "#f08c00", color: "white" }} className="font-extrabold text-sm">
              <td colSpan={5} className="p-2 text-right">Total Investment</td>
              <td className="p-2 text-right">{inr(computed.totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </Page>

      {/* T&C */}
      <Page>
        <div className="flex items-center justify-between border-b-2 pb-3 mb-6" style={{ borderColor: "#f08c00" }}>
          <Logo small />
          <div className="text-xs text-slate-500">Terms & Conditions</div>
        </div>
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Terms & Conditions</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{terms}</pre>

        <div className="mt-12 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-t border-slate-400 pt-2">For Unite Solar</div>
            <div className="text-slate-500">Authorised Signatory</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2">Client Acceptance</div>
            <div className="text-slate-500">{client.name || "—"}</div>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-slate-400">Powered by Unite Developers Global Inc</div>
      </Page>
    </>
  );

  // Build sections after T&C above is closed; we'll instead inject the financial pages BEFORE T&C using a helper
  // (kept lower than easy refactor, see note below)
};

export default ResidentialDocument;
          <div className="text-xs text-slate-500">Terms & Conditions</div>
        </div>
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Terms & Conditions</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{terms}</pre>

        <div className="mt-12 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-t border-slate-400 pt-2">For Unite Solar</div>
            <div className="text-slate-500">Authorised Signatory</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2">Client Acceptance</div>
            <div className="text-slate-500">{client.name || "—"}</div>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-slate-400">Powered by Unite Developers Global Inc</div>
      </Page>
    </div>
  );
};

export default ResidentialDocument;