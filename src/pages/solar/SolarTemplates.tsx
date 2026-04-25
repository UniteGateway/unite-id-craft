import React from "react";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { VARIABLE_SLIDE_REGISTRY } from "@/components/proposals/variable-slides/registry";
import { Layers } from "lucide-react";

const SolarTemplates: React.FC = () => {
  return (
    <SolarShell title="Templates">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Slide Templates</h1>
        <p className="text-sm text-muted-foreground">The variable slides used to assemble every proposal deck.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {VARIABLE_SLIDE_REGISTRY.map((s) => (
          <Card key={s.key} className="p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
                {s.n}
              </span>
              <div className="font-semibold">{s.title}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {s.Component ? "Ready" : "Coming soon"}
            </div>
          </Card>
        ))}
      </div>
    </SolarShell>
  );
};

export default SolarTemplates;