import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Branding {
  brand_logo_url: string | null;
  brand_primary_color: string | null;
  brand_theme: string | null;
  display_name: string | null;
  company: string | null;
}

const EMPTY: Branding = {
  brand_logo_url: null,
  brand_primary_color: null,
  brand_theme: null,
  display_name: null,
  company: null,
};

export function useBranding() {
  const { user } = useAuth();
  const [branding, setBranding] = useState<Branding>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setBranding(EMPTY);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("brand_logo_url, brand_primary_color, brand_theme, display_name, company")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setBranding(data as Branding);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { branding, loading, refresh, setBranding };
}