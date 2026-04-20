import React, { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, ImagePlus, Trash2, ShieldCheck, Loader2, Palette, Plus } from "lucide-react";

interface BrandAsset { id: string; name: string; asset_type: string; image_url: string; storage_path: string | null; }
interface ApiKeyRow { provider: string; label: string | null; updated_at: string; }
interface BrandPalette { id: string; name: string; colors: string[]; }

const AdminPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [savedKeys, setSavedKeys] = useState<ApiKeyRow[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [uploadType, setUploadType] = useState<"logo" | "image">("logo");
  const [uploading, setUploading] = useState(false);

  const [palettes, setPalettes] = useState<BrandPalette[]>([]);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [newPaletteColors, setNewPaletteColors] = useState("#f08c00, #3a3a3a, #1a3c6e");
  const [savingPalette, setSavingPalette] = useState(false);

  // Self-claim admin if no admin exists yet (bootstrap)
  const [bootstrapping, setBootstrapping] = useState(false);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  useEffect(() => {
    const checkBootstrap = async () => {
      if (!user || isAdmin || roleLoading) return;
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      setNeedsBootstrap((count ?? 0) === 0);
    };
    checkBootstrap();
  }, [user, isAdmin, roleLoading]);

  const claimAdmin = async () => {
    if (!user) return;
    setBootstrapping(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    setBootstrapping(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You're now the admin. Reloading…");
    setTimeout(() => window.location.reload(), 800);
  };

  const loadAdminData = async () => {
    const [{ data: keys }, { data: brand }, { data: pals }] = await Promise.all([
      supabase.from("api_keys").select("provider,label,updated_at"),
      supabase.from("brand_assets").select("*").order("created_at", { ascending: false }),
      supabase.from("brand_palettes").select("id,name,colors").order("created_at", { ascending: true }),
    ]);
    setSavedKeys(keys ?? []);
    setAssets(brand ?? []);
    setPalettes((pals ?? []).map((p: any) => ({ ...p, colors: Array.isArray(p.colors) ? p.colors : [] })));
  };

  useEffect(() => { if (isAdmin) loadAdminData(); }, [isAdmin]);

  const saveKey = async (provider: "openai" | "gemini", apiKey: string, label: string) => {
    if (!apiKey.trim()) { toast.error("Paste an API key first"); return; }
    setSavingKey(provider);
    const { error } = await supabase.from("api_keys").upsert(
      { provider, api_key: apiKey.trim(), label, updated_by: user!.id },
      { onConflict: "provider" }
    );
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`${label} key saved. Design team can use it now.`);
    if (provider === "openai") setOpenaiKey("");
    else setGeminiKey("");
    loadAdminData();
  };

  const deleteKey = async (provider: string) => {
    if (!confirm(`Remove ${provider} key?`)) return;
    const { error } = await supabase.from("api_keys").delete().eq("provider", provider);
    if (error) { toast.error(error.message); return; }
    toast.success("Key removed");
    loadAdminData();
  };

  const uploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("brand-assets").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(path);
    const { error: insErr } = await supabase.from("brand_assets").insert({
      name: file.name, asset_type: uploadType, image_url: publicUrl, storage_path: path, uploaded_by: user.id,
    });
    setUploading(false);
    e.target.value = "";
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Brand asset added to library");
    loadAdminData();
  };

  const deleteAsset = async (a: BrandAsset) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    if (a.storage_path) await supabase.storage.from("brand-assets").remove([a.storage_path]);
    await supabase.from("brand_assets").delete().eq("id", a.id);
    toast.success("Removed");
    loadAdminData();
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          {needsBootstrap ? (
            <>
              <p className="text-muted-foreground">No admin exists yet. Claim the admin role to manage API keys and the brand library.</p>
              <Button onClick={claimAdmin} disabled={bootstrapping}>
                {bootstrapping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Become the first admin
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Ask an existing admin to grant you access.</p>
          )}
        </main>
      </div>
    );
  }

  const hasKey = (p: string) => savedKeys.find(k => k.provider === p);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        <PageBanner
          image={BANNERS.admin}
          eyebrow="Admin Console"
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          title="Studio Administration"
          subtitle="Manage AI provider keys and the shared brand library used across the studio."
          height="sm"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> AI Model API Keys</CardTitle>
            <CardDescription>Paste a key here and the design team can immediately generate with that model. Keys are stored securely and never shown to non-admins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Unite GPT (OpenAI / ChatGPT)</Label>
                {hasKey("openai") && (
                  <span className="text-xs text-primary font-medium flex items-center gap-2">
                    ✓ Configured
                    <button onClick={() => deleteKey("openai")} className="text-destructive hover:underline">remove</button>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
                <Button onClick={() => saveKey("openai", openaiKey, "Unite GPT")} disabled={savingKey === "openai"}>
                  {savingKey === "openai" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Get from platform.openai.com → API keys. Used for image generation with gpt-image-1.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Unite Flash (Google Gemini)</Label>
                {hasKey("gemini") ? (
                  <span className="text-xs text-primary font-medium flex items-center gap-2">
                    ✓ Configured
                    <button onClick={() => deleteKey("gemini")} className="text-destructive hover:underline">remove</button>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Falls back to built-in Lovable AI</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input type="password" placeholder="AIza..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
                <Button onClick={() => saveKey("gemini", geminiKey, "Unite Flash")} disabled={savingKey === "gemini"}>
                  {savingKey === "gemini" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Get from aistudio.google.com → Get API key. Optional — without it, Unite Flash uses Lovable AI.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Brand Library</CardTitle>
            <CardDescription>Upload official Unite Solar logos and approved imagery. Available to the whole design team in every studio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-center">
              <select value={uploadType} onChange={(e) => setUploadType(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="logo">Logo</option>
                <option value="image">Image</option>
              </select>
              <div className="relative flex-1">
                <input type="file" accept="image/*" onChange={uploadAsset} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="h-10 rounded-md border-2 border-dashed border-border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading…</> : <>Click to upload {uploadType}</>}
                </div>
              </div>
            </div>

            {assets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No brand assets yet. Upload your first logo above.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {assets.map(a => (
                  <div key={a.id} className="group relative rounded-lg border border-border overflow-hidden bg-card">
                    <div className="aspect-square bg-muted/30 flex items-center justify-center p-2">
                      <img src={a.image_url} alt={a.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="p-2 border-t border-border flex items-center justify-between gap-1">
                      <span className="text-xs truncate">{a.name}</span>
                      <button onClick={() => deleteAsset(a)} className="text-destructive hover:bg-destructive/10 p-1 rounded shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="absolute top-1 left-1 text-[9px] uppercase tracking-wider bg-background/90 px-1.5 py-0.5 rounded">{a.asset_type}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;
