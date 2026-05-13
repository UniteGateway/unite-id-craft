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
import SocialMedia from "./pages/SocialMedia.tsx";
import Admin from "./pages/Admin.tsx";
import AdminHub from "./pages/AdminHub.tsx";
import Proposals from "./pages/Proposals.tsx";
import Designs from "./pages/Designs.tsx";
import ProposalEditor from "./pages/ProposalEditor.tsx";
import CreateProposal from "./pages/CreateProposal.tsx";
import ProposalVariableSlides from "./pages/ProposalVariableSlides.tsx";
import GenerateProposal from "./pages/GenerateProposal.tsx";
import CommunityProposalEditor from "./pages/CommunityProposalEditor.tsx";
import ResidentialProposalEditor from "./pages/ResidentialProposalEditor.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import SolarDashboard from "./pages/solar/SolarDashboard.tsx";
import SolarMyProposals from "./pages/solar/SolarMyProposals.tsx";
import SolarTemplates from "./pages/solar/SolarTemplates.tsx";
import SolarAssets from "./pages/solar/SolarAssets.tsx";
import SolarBranding from "./pages/solar/SolarBranding.tsx";
import SolarSettings from "./pages/solar/SolarSettings.tsx";
import SolarProposalSummary from "./pages/solar/SolarProposalSummary.tsx";
import SolarProposalSlides from "./pages/solar/SolarProposalSlides.tsx";

const queryClient = new QueryClient();

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
            <Route path="/id-cards" element={<IDCards />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visiting-cards"
              element={
                <ProtectedRoute>
                  <VisitingCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social-media"
              element={
                <ProtectedRoute>
                  <SocialMedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hub"
              element={
                <ProtectedRoute>
                  <AdminHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <ProtectedRoute>
                  <Proposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/techno-commercial/new"
              element={
                <ProtectedRoute>
                  <ProposalVariableSlides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-proposal"
              element={
                <ProtectedRoute>
                  <CreateProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposal-variable-slides"
              element={
                <ProtectedRoute>
                  <ProposalVariableSlides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-proposal"
              element={
                <ProtectedRoute>
                  <GenerateProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/:id"
              element={
                <ProtectedRoute>
                  <ProposalEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/community/:id"
              element={
                <ProtectedRoute>
                  <CommunityProposalEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/residential/:id"
              element={
                <ProtectedRoute>
                  <ResidentialProposalEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/designs/:kind"
              element={
                <ProtectedRoute>
                  <Designs />
                </ProtectedRoute>
              }
            />
            {/* Solar SaaS shell */}
            <Route path="/solar" element={<ProtectedRoute><SolarDashboard /></ProtectedRoute>} />
            <Route path="/solar/generate" element={<ProtectedRoute><GenerateProposal /></ProtectedRoute>} />
            <Route path="/solar/proposals" element={<ProtectedRoute><SolarMyProposals /></ProtectedRoute>} />
            <Route path="/solar/proposals/:id/summary" element={<ProtectedRoute><SolarProposalSummary /></ProtectedRoute>} />
            <Route path="/solar/proposals/:id/slides" element={<ProtectedRoute><SolarProposalSlides /></ProtectedRoute>} />
            <Route path="/solar/templates" element={<ProtectedRoute><SolarTemplates /></ProtectedRoute>} />
            <Route path="/solar/assets" element={<ProtectedRoute><SolarAssets /></ProtectedRoute>} />
            <Route path="/solar/branding" element={<ProtectedRoute><SolarBranding /></ProtectedRoute>} />
            <Route path="/solar/settings" element={<ProtectedRoute><SolarSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
