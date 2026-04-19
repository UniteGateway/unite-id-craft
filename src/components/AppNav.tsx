import { NavLink, useNavigate } from "react-router-dom";
import { CreditCard, Contact, LayoutDashboard, LogOut, LogIn, Home as HomeIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

const AppNav: React.FC = () => {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navItem}>
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">ID Cards</span>
          </NavLink>
          <NavLink to="/visiting-cards" className={navItem}>
            <Contact className="h-4 w-4" />
            <span className="hidden sm:inline">Visiting Cards</span>
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navItem}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
          )}
        </div>
        <div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav("/"); }}>
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => nav("/auth")}>
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNav;
