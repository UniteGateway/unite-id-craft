import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Layers, Loader2, Upload, Trash2, Save, FileImage } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FixedSlide {
  id: string;
  slide_number: number;
  title: string;
  description: string | null;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  active: boolean;
}

const SLIDE_DEFS: { n: number; title: string }[] = [
  { n: 1, title: "About Unite Solar" },
  { n: 2, title: "Our Credentials & Trust" },
  { n: 3, title: "Project Showcase" },
  { n: 4, title: "Business Models Overview" },
  { n: 5, title: "Community Investment Model" },
  { n: 6, title: "Model Comparison" },
  { n: 7, title: "Environmental Impact" },
  { n: 8, title: "Why Unite Solar / Value Proposition" },
  { n: 9, title: "Conclusion & Call to Action" },
];

const FixedSlidesManager: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<FixedSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fixed_slides")
      .select("*")
      .order("slide_number", { ascending: true })
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems((data ?? []) as FixedSlide[]);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<FixedSlide>) =>
    setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));

  const uploadForSlide = async (slideNumber: number, defaultTitle: string, file: File) => {
    if (!user) return;
    setUploadingFor(slideNumber);
    try {
      const path = `slide-${slideNumber}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("fixed-slides")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("fixed-slides").getPublicUrl(path);
      const { data, error } = await supabase
        .from("fixed_slides")
        .insert({
          slide_number: slideNumber,
          title: defaultTitle,
          image_url: pub.publicUrl,
          storage_path: path,
          uploaded_by: user.id,
          sort_order: items.filter(i => i.slide_number === slideNumber).length,
        })
        .select("*")
        .single();
      if (error) throw error;
      setItems(prev => [...prev, data as FixedSlide]);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingFor(null);
    }
  };

  const saveItem = async (it: FixedSlide) => {
    setSavingId(it.id);
    const { error } = await supabase
      .from("fixed_slides")
      .update({
        title: it.title,
        description: it.description,
        sort_order: it.sort_order,
        active: it.active,
      })
      .eq("id", it.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const removeItem = async (it: FixedSlide) => {
    if (!confirm(`Delete "${it.title}"?`)) return;
    if (it.storage_path) await supabase.storage.from("fixed-slides").remove([it.storage_path]);
    const { error } = await supabase.from("fixed_slides").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    setItems(prev => prev.filter(x => x.id !== it.id));
    toast.success("Deleted");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Fixed Proposal Slides</CardTitle>
        <CardDescription>
          Upload A4 images (or PDFs exported as images) for each of the 9 fixed brand slides. These get preloaded automatically when anyone creates a new proposal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="py-8 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          SLIDE_DEFS.map(def => {
            const slideItems = items.filter(i => i.slide_number === def.n);
            const inputId = `fixed-slide-upload-${def.n}`;
            return (
              <div key={def.n} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {def.n}
                    </span>
                    <h4 className="text-sm font-semibold truncate">{def.title}</h4>
                  </div>
                  <div>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadForSlide(def.n, def.title, f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(inputId)?.click()}
                      disabled={uploadingFor === def.n}
                    >
                      {uploadingFor === def.n
                        ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload A4
                    </Button>
                  </div>
                </div>

                {slideItems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                    <FileImage className="h-5 w-5 opacity-60" />
                    No content uploaded yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {slideItems.map(it => (
                      <div key={it.id} className="flex gap-3 rounded-md border border-border p-2">
                        <a href={it.image_url} target="_blank" rel="noreferrer" className="shrink-0">
                          <img src={it.image_url} alt={it.title} className="h-24 w-20 object-cover rounded bg-muted" />
                        </a>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Input value={it.title} onChange={(e) => update(it.id, { title: e.target.value })} className="h-8 text-xs" />
                          <Textarea
                            rows={2}
                            value={it.description ?? ""}
                            onChange={(e) => update(it.id, { description: e.target.value })}
                            placeholder="Optional caption"
                            className="text-xs"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Switch checked={it.active} onCheckedChange={(v) => update(it.id, { active: v })} />
                              <span className="text-[11px] text-muted-foreground">{it.active ? "Active" : "Hidden"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => removeItem(it)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                              <Button size="sm" onClick={() => saveItem(it)} disabled={savingId === it.id}>
                                {savingId === it.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Save className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default FixedSlidesManager;