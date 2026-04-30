import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LiveChat from "./components/LiveChat";
import ScrollToTop from "./components/ScrollToTop";

// Code-split heavy pages for smaller initial bundle
const EventDetail = lazy(() => import("./pages/EventDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TeamMLBPage = lazy(() => import("./pages/TeamMLBPage"));
const TeamNHLPage = lazy(() => import("./pages/TeamNHLPage"));
const TeamNBAPage = lazy(() => import("./pages/TeamNBAPage"));
const TeamNFLPage = lazy(() => import("./pages/TeamNFLPage"));
const TeamMLSPage = lazy(() => import("./pages/TeamMLSPage"));
const TeamCFLPage = lazy(() => import("./pages/TeamCFLPage"));
const TeamWNBAPage = lazy(() => import("./pages/TeamWNBAPage"));
const Membership = lazy(() => import("./pages/Membership"));
const ResellerDashboard = lazy(() => import("./pages/ResellerDashboard"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const NotificationDetail = lazy(() => import("./pages/NotificationDetail"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Account = lazy(() => import("./pages/Account"));
const SellerAgreement = lazy(() => import("./pages/SellerAgreement"));
const CheapBlueJaysTickets = lazy(() => import("./pages/CheapBlueJaysTickets"));

const queryClient = new QueryClient();

// Minimal loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
          <BrowserRouter>
            <ScrollToTop />
            <LiveChat />
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/reseller" element={<ResellerDashboard />} />
                <Route path="/seller-agreement" element={<SellerAgreement />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-canceled" element={<PaymentCanceled />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/notifications/:id" element={<NotificationDetail />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cheap-blue-jays-tickets" element={<CheapBlueJaysTickets />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
