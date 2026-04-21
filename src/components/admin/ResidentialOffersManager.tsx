import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Gift, Loader2, Plus, Trash2, Save, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  min_kw: number;
  max_kw: number;
  discount_amount: number;
  freebie_label: string | null;
  flyer_image_url: string | null;
  flyer_storage_path: string | null;
  active: boolean;
}

const blank = (): Omit<Offer, "id"> => ({
  name: "New Offer", description: "", min_kw: 1, max_kw: 10,
  discount_amount: 0, freebie_label: "", flyer_image_url: null, flyer_storage_path: null, active: true,
});

const ResidentialOffersManager: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("residential_offers").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setOffers((data ?? []) as Offer[]);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Offer>) =>
    setOffers(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));

  const addOffer = async () => {
    const { data, error } = await supabase.from("residential_offers").insert(blank()).select("*").single();
    if (error) return toast.error(error.message);
    setOffers(prev => [data as Offer, ...prev]);
  };

  const saveOffer = async (o: Offer) => {
    setSavingId(o.id);
    const { error } = await supabase.from("residential_offers").update({
      name: o.name, description: o.description, min_kw: o.min_kw, max_kw: o.max_kw,
      discount_amount: o.discount_amount, freebie_label: o.freebie_label,
      flyer_image_url: o.flyer_image_url, flyer_storage_path: o.flyer_storage_path, active: o.active,
    }).eq("id", o.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Offer saved");
  };

  const deleteOffer = async (o: Offer) => {
    if (!confirm(`Delete offer "${o.name}"?`)) return;
    if (o.flyer_storage_path) await supabase.storage.from("proposals").remove([o.flyer_storage_path]);
    const { error } = await supabase.from("residential_offers").delete().eq("id", o.id);
    if (error) return toast.error(error.message);
    setOffers(prev => prev.filter(x => x.id !== o.id));
    toast.success("Deleted");
  };

  const uploadFlyer = async (o: Offer, file: File) => {
    if (!user) return;
    const path = `${user.id}/offers/${o.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("proposals").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("proposals").getPublicUrl(path);
    update(o.id, { flyer_image_url: pub.publicUrl, flyer_storage_path: path });
    toast.success("Flyer uploaded — click Save");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Residential Offers</CardTitle>
        <CardDescription>Define discounts and freebies that apply to residential proposals based on system size. Users can pick an offer in the proposal editor and download a flyer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={addOffer}><Plus className="h-3.5 w-3.5 mr-1" /> Add offer</Button>
        </div>
        {loading ? (
          <div className="py-8 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : offers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No offers yet.</p>
        ) : (
          <div className="space-y-4">
            {offers.map(o => (
              <div key={o.id} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input value={o.name} onChange={(e) => update(o.id, { name: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={o.active} onCheckedChange={(v) => update(o.id, { active: v })} />
                    <span className="text-xs">{o.active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea rows={2} value={o.description ?? ""} onChange={(e) => update(o.id, { description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div><Label className="text-xs">Min kW</Label><Input type="number" value={o.min_kw} onChange={(e) => update(o.id, { min_kw: +e.target.value })} /></div>
                  <div><Label className="text-xs">Max kW</Label><Input type="number" value={o.max_kw} onChange={(e) => update(o.id, { max_kw: +e.target.value })} /></div>
                  <div><Label className="text-xs">Discount (₹)</Label><Input type="number" value={o.discount_amount} onChange={(e) => update(o.id, { discount_amount: +e.target.value })} /></div>
                  <div><Label className="text-xs">Freebie label</Label><Input value={o.freebie_label ?? ""} onChange={(e) => update(o.id, { freebie_label: e.target.value })} placeholder="Free scooter" /></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Flyer image (optional)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="file" accept="image/*" hidden id={`flyer-${o.id}`}
                        onChange={(e) => e.target.files?.[0] && uploadFlyer(o, e.target.files[0])} />
                      <Button size="sm" variant="outline" onClick={() => document.getElementById(`flyer-${o.id}`)?.click()}>
                        <Upload className="h-3.5 w-3.5 mr-1" /> Upload flyer
                      </Button>
                      {o.flyer_image_url && <a href={o.flyer_image_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View current</a>}
                    </div>
                  </div>
                  {o.flyer_image_url && (
                    <img src={o.flyer_image_url} alt="flyer" className="h-16 w-16 object-cover rounded border border-border" />
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="ghost" onClick={() => deleteOffer(o)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Button size="sm" onClick={() => saveOffer(o)} disabled={savingId === o.id}>
                    {savingId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />} Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentialOffersManager;