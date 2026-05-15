import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string; }

interface Props {
  context: Record<string, any>;
  enabled: boolean;
}

const SUGGESTED = [
  "Which system type suits me — on-grid, off-grid or hybrid?",
  "How much battery backup do I need?",
  "What's the best tilt and orientation?",
  "When will my investment pay back?",
];

const FeasibilityChatbot: React.FC<Props> = ({ context, enabled }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    if (!enabled) {
      toast.error("Generate the feasibility report first so I can answer based on your bill.");
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("feasibility-chat", {
        body: { messages: next, context },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.reply || "(no answer)" }]);
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
      setMessages(next); // keep user msg
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col" style={{ height: 520 }}>
      <div className="px-4 py-3 border-b bg-gradient-to-r from-[#0a1b33] to-[#1a3c6e] text-white flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm">Solar AI Consultant</div>
          <div className="text-[11px] text-white/70">Answers based on your uploaded bill</div>
        </div>
        <div className="ml-auto text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-300 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> AI
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {enabled
                ? "Ask anything about your solar plan. Try one of these:"
                : "Generate the feasibility report above, then I can answer your questions."}
            </div>
            {enabled && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-background border border-border rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 border-t flex gap-2 bg-background"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={enabled ? "Ask about your solar plan…" : "Generate report first to enable chat"}
          disabled={!enabled || loading}
        />
        <Button type="submit" size="icon" disabled={!enabled || loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default FeasibilityChatbot;