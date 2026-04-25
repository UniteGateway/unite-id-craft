import React, { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import SolarSidebar from "./SolarSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Sun } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useBranding } from "@/hooks/useBranding";

interface SolarShellProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** When true, hides max-width constraint so content can use full viewport. */
  fluid?: boolean;
}

export const SolarShell: React.FC<SolarShellProps> = ({
  title,
  actions,
  children,
  fluid,
}) => {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const { branding } = useBranding();

  // Apply user brand color as a CSS variable scoped to the shell
  useEffect(() => {
    if (branding.brand_primary_color) {
      document.documentElement.style.setProperty("--solar-brand", branding.brand_primary_color);
    }
  }, [branding.brand_primary_color]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SolarSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm font-semibold">
              {branding.brand_logo_url
                ? <img src={branding.brand_logo_url} alt="logo" className="h-6 w-6 object-contain" />
                : <Sun className="h-4 w-4 text-primary" />}
              <span>{branding.company || "Unite Solar"}</span>
              {title && <span className="text-muted-foreground font-normal hidden md:inline">/ {title}</span>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <ThemeToggle />
              {user ? (
                <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav("/"); }}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Sign out</span>
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={() => nav("/auth")}>
                  <LogIn className="h-4 w-4 mr-1" /> Sign in
                </Button>
              )}
            </div>
          </header>
          <main className={fluid ? "flex-1" : "flex-1"}>
            <div className={fluid ? "p-4" : "mx-auto max-w-7xl px-4 py-6 pb-[env(safe-area-inset-bottom)]"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SolarShell;