import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, RefreshCw, Trash2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import type { SlideContent } from "./CommunitySlideDeck";

interface Props {
  slides: SlideContent[];
  onChange: (next: SlideContent[]) => void;
  onRegenerate: (index: number, instruction?: string) => Promise<void>;
  regeneratingIndex: number | null;
}

const SlideEditor: React.FC<Props> = ({ slides, onChange, onRegenerate, regeneratingIndex }) => {
  const [open, setOpen] = useState<number | null>(0);
  const [instructions, setInstructions] = useState<Record<number, string>>({});

  const update = (idx: number, patch: Partial<SlideContent>) => {
    const next = slides.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(next);
  };
  const updateBullet = (idx: number, bIdx: number, value: string) => {
    const bullets = [...slides[idx].bullets];
    bullets[bIdx] = value;
    update(idx, { bullets });
  };
  const removeBullet = (idx: number, bIdx: number) => {
    update(idx, { bullets: slides[idx].bullets.filter((_, i) => i !== bIdx) });
  };
  const addBullet = (idx: number) => {
    update(idx, { bullets: [...slides[idx].bullets, "New point"] });
  };

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground px-1">Edit slides</div>
        {slides.map((s, idx) => {
          const isOpen = open === idx;
          const isRegen = regeneratingIndex === idx;
          return (
            <div key={idx} className="rounded-md border bg-muted/20">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-2.5 text-left hover:bg-muted/40 rounded-md"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{idx + 1}</span>
                  <span className="text-sm font-medium truncate">{s.title || "Untitled"}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              {isOpen && (
                <div className="p-3 pt-0 space-y-2">
                  <Input
                    value={s.title}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    placeholder="Slide title"
                    className="text-sm font-semibold"
                  />
                  <Input
                    value={s.subtitle || ""}
                    onChange={(e) => update(idx, { subtitle: e.target.value })}
                    placeholder="Subtitle (optional)"
                    className="text-xs"
                  />
                  <div className="space-y-1.5">
                    {s.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-1.5">
                        <Textarea
                          value={b}
                          onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                          rows={2}
                          className="text-xs resize-none flex-1"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeBullet(idx, bIdx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-7 w-full text-xs" onClick={() => addBullet(idx)}>
                      <Plus className="h-3 w-3" /> Add bullet
                    </Button>
                  </div>
                  {s.highlight && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <Input
                        value={s.highlight.label}
                        onChange={(e) => update(idx, { highlight: { ...s.highlight!, label: e.target.value } })}
                        placeholder="Highlight label"
                        className="text-xs"
                      />
                      <Input
                        value={s.highlight.value}
                        onChange={(e) => update(idx, { highlight: { ...s.highlight!, value: e.target.value } })}
                        placeholder="Highlight value"
                        className="text-xs"
                      />
                    </div>
                  )}
                  <div className="pt-1.5 border-t space-y-1.5">
                    <Textarea
                      value={instructions[idx] || ""}
                      onChange={(e) => setInstructions({ ...instructions, [idx]: e.target.value })}
                      placeholder="Optional: tell AI how to improve this slide..."
                      rows={2}
                      className="text-xs resize-none"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      disabled={isRegen}
                      onClick={() => onRegenerate(idx, instructions[idx])}
                    >
                      {isRegen ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Regenerate this slide
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SlideEditor;