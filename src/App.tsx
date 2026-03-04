import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import TeamMLBPage from "./pages/TeamMLBPage";
import TeamNHLPage from "./pages/TeamNHLPage";
import TeamNBAPage from "./pages/TeamNBAPage";
import TeamNFLPage from "./pages/TeamNFLPage";
import TeamMLSPage from "./pages/TeamMLSPage";
import TeamCFLPage from "./pages/TeamCFLPage";
import TeamWNBAPage from "./pages/TeamWNBAPage";
import Membership from "./pages/Membership";
import ResellerDashboard from "./pages/ResellerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/teams/mlb/:slug" element={<TeamMLBPage />} />
            <Route path="/teams/nhl/:slug" element={<TeamNHLPage />} />
            <Route path="/teams/nba/:slug" element={<TeamNBAPage />} />
            <Route path="/teams/nfl/:slug" element={<TeamNFLPage />} />
            <Route path="/teams/mls/:slug" element={<TeamMLSPage />} />
            <Route path="/teams/cfl/:slug" element={<TeamCFLPage />} />
            <Route path="/teams/wnba/:slug" element={<TeamWNBAPage />} />
            {/* Legacy Blue Jays route redirect */}
            <Route path="/teams/blue-jays" element={<TeamMLBPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/reseller" element={<ResellerDashboard />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
