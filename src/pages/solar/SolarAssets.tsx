import React, { useEffect, useState } from "react";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ImageOff } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  image_url: string;
}

const SolarAssets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("brand_assets")
        .select("id, name, asset_type, image_url")
        .order("created_at", { ascending: false });
      setAssets((data ?? []) as Asset[]);
      setLoading(false);
    })();
  }, []);

  return (
    <SolarShell title="Assets">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Brand Assets</h1>
        <p className="text-sm text-muted-foreground">Logos and images available across all proposals (managed by admins).</p>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : assets.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <ImageOff className="h-6 w-6" />
          No brand assets uploaded yet.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              <div className="aspect-square bg-muted/40 flex items-center justify-center">
                <img src={a.image_url} alt={a.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-2">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.asset_type}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SolarShell>
  );
};

export default SolarAssets;