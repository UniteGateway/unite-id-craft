import React, { useEffect, useState } from "react";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import {
  getMapProvider,
  setMapProvider,
  getGoogleMapsApiKey,
  setGoogleMapsApiKey,
  type MapProvider,
} from "@/lib/geocode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SolarSettings: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [mapProvider, setMapProviderState] = useState<MapProvider>("osm");
  const [googleKey, setGoogleKey] = useState("");

  useEffect(() => {
    setMapProviderState(getMapProvider());
    setGoogleKey(getGoogleMapsApiKey());
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setDisplayName(data?.display_name ?? "");
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setMapProvider(mapProvider);
    setGoogleMapsApiKey(googleKey.trim());
    toast.success("Saved");
  };

  return (
    <SolarShell title="Settings">
      <h1 className="text-2xl font-bold mb-5">Settings</h1>
      <Card className="p-5 max-w-xl space-y-4">
        <div>
          <Label>Display Name</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="border-t pt-4 space-y-3">
          <div>
            <Label>Location Map Provider</Label>
            <Select value={mapProvider} onValueChange={(v) => setMapProviderState(v as MapProvider)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="osm">OpenStreetMap (free, no key)</SelectItem>
                <SelectItem value="google">Google Static Maps (satellite)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mapProvider === "google" && (
            <div>
              <Label>Google Maps API Key</Label>
              <Input
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIza..."
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enable "Maps Static API" in Google Cloud Console. Stored locally in your browser.
              </p>
            </div>
          )}
        </div>
        <div className="pt-2">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </Card>
    </SolarShell>
  );
};

export default SolarSettings;