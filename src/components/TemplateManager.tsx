import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CardTemplate {
  id: string;
  name: string;
  image: string;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTemplates((prev) => [
          ...prev,
          {
            id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name.replace(/\.[^.]+$/, ""),
            image: ev.target?.result as string,
          },
        ]);
        toast.success(`Template "${file.name}" uploaded`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomLogo(ev.target?.result as string);
      toast.success("Custom logo uploaded");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const removeTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { prompt: aiPrompt.trim() },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate template");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.image) {
        throw new Error("No image was returned");
      }

      const newTemplate: CardTemplate = {
        id: `ai-${Date.now()}`,
        name: `AI: ${aiPrompt.slice(0, 30)}`,
        image: data.image,
      };

      setTemplates((prev) => [...prev, newTemplate]);
      toast.success("AI template generated!");
      setAiPrompt("");
    } catch (err: any) {
      console.error("AI generation error:", err);
      toast.error(err.message || "Failed to generate template");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-center">
        Templates & Customization
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => { setShowUpload(!showUpload); setShowAI(false); }}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
        >
          <Upload className="h-6 w-6 text-primary shrink-0" />
          <div className="text-left">
            <span className="font-medium text-foreground text-sm">Upload Templates</span>
            <p className="text-xs text-muted-foreground">Upload custom card designs</p>
          </div>
        </button>

        <button
          onClick={() => { setShowAI(!showAI); setShowUpload(false); }}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
        >
          <Sparkles className="h-6 w-6 text-primary shrink-0" />
          <div className="text-left">
            <span className="font-medium text-foreground text-sm">AI Template</span>
            <p className="text-xs text-muted-foreground">Generate designs with AI</p>
          </div>
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Upload Card Templates</h4>
            <p className="text-xs text-muted-foreground">Upload complete card template images. Supported: PNG, JPG, WEBP</p>
            <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 cursor-pointer hover:border-primary transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleTemplateUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">Click or drop templates here</span>
                <span className="text-xs">Multiple files supported</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Custom Logo</h4>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-3 cursor-pointer hover:border-primary transition-colors flex-1">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                {customLogo ? (
                  <div className="flex items-center gap-2">
                    <img src={customLogo} alt="Logo" className="h-10 object-contain" />
                    <span className="text-xs text-muted-foreground">Click to change</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs">Upload your logo</span>
                  </div>
                )}
              </div>
              {customLogo && (
                <Button size="sm" variant="ghost" onClick={() => { setCustomLogo(null); toast.info("Logo removed"); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {templates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Uploaded Templates ({templates.length})</h4>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={tpl.image} alt={tpl.name} className="w-full aspect-[54/86] object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="destructive" onClick={() => removeTemplate(tpl.id)} className="text-xs">
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                    <p className="text-xs text-center py-1 truncate px-1">{tpl.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generation Section */}
      {showAI && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Generate Template with AI</h4>
          <p className="text-xs text-muted-foreground">
            Describe the card layout, colors, and style you want. AI will generate a custom template.
          </p>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="E.g., Modern dark blue card with gold accents, company logo at top, employee photo in center with rounded corners, name in white bold text..."
            className="min-h-[100px] text-sm"
            disabled={isGenerating}
          />
          <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Template
              </>
            )}
          </Button>

          {/* Show AI-generated templates */}
          {templates.filter((t) => t.id.startsWith("ai-")).length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium text-foreground">Generated Templates</h4>
              <div className="grid grid-cols-2 gap-2">
                {templates.filter((t) => t.id.startsWith("ai-")).map((tpl) => (
                  <div key={tpl.id} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={tpl.image} alt={tpl.name} className="w-full aspect-[54/86] object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="destructive" onClick={() => removeTemplate(tpl.id)} className="text-xs">
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                    <p className="text-xs text-center py-1 truncate px-1">{tpl.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
