import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!user) {
    const redirect = location.pathname + location.search + location.hash;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
