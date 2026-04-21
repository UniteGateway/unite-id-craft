import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Loader2, Save } from "lucide-react";

type Settings = {
  id: string;
  warranties: string;
  service_amc: string;
  general_terms: string;
};

const ProposalSettingsManager: React.FC = () => {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("proposal_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setS(data as any);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase
      .from("proposal_settings")
      .update({
        warranties: s.warranties,
        service_amc: s.service_amc,
        general_terms: s.general_terms,
      })
      .eq("id", s.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Defaults saved. New proposals will use these.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Proposal Defaults
        </CardTitle>
        <CardDescription>
          Warranties, Service AMC, and General Terms shown on every new proposal. Editors can still tweak them per proposal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !s ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <Label className="text-xs">Warranties</Label>
              <Textarea
                rows={6}
                value={s.warranties}
                onChange={(e) => setS({ ...s, warranties: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Service AMC</Label>
              <Textarea
                rows={6}
                value={s.service_amc}
                onChange={(e) => setS({ ...s, service_amc: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">General Terms &amp; Conditions</Label>
              <Textarea
                rows={8}
                value={s.general_terms}
                onChange={(e) => setS({ ...s, general_terms: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save defaults
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalSettingsManager;