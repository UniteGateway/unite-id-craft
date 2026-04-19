import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing.tsx";
import Home from "./pages/Home.tsx";
import IDCards from "./pages/IDCards.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import VisitingCards from "./pages/VisitingCards.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ComingSoon from "./pages/ComingSoon.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AppShell from "./components/AppShell.tsx";

const queryClient = new QueryClient();

const Shell = ({ children }: { children: React.ReactNode }) => <AppShell>{children}</AppShell>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Studio routes — all wrapped in sliding sidebar shell */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Shell><Home /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/id-cards"
              element={
                <ProtectedRoute>
                  <Shell><IDCards /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visiting-cards"
              element={
                <ProtectedRoute>
                  <Shell><VisitingCards /></Shell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Shell><Dashboard /></Shell>
                </ProtectedRoute>
              }
            />

            {/* Coming soon module routes */}
            {["flyers", "brochures", "presentations", "proposals", "letterheads"].map((p) => (
              <Route
                key={p}
                path={`/${p}`}
                element={
                  <ProtectedRoute>
                    <Shell><ComingSoon /></Shell>
                  </ProtectedRoute>
                }
              />
            ))}
            <Route
              path="/coming-soon"
              element={
                <ProtectedRoute>
                  <Shell><ComingSoon /></Shell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
