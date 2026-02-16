import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import MaintenanceMode from "@/components/MaintenanceMode";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import AuthAction from "./pages/AuthAction";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import Scenarios from "./pages/Scenarios";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Disclaimer from "./pages/Disclaimer";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AnalyticsTracker from "./components/AnalyticsTracker";

const queryClient = new QueryClient();

// Set to true to enable maintenance mode
const MAINTENANCE_MODE = false;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <AnalyticsTracker />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
          <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/auth-action" element={<PageTransition><AuthAction /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route path="/calculator" element={<PageTransition><Calculator /></PageTransition>} />
          <Route path="/edit" element={<PageTransition><Calculator /></PageTransition>} />
          <Route path="/my-finances" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/scenarios"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Scenarios />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/admin"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms-of-use" element={<PageTransition><TermsOfUse /></PageTransition>} />
          <Route path="/disclaimer" element={<PageTransition><Disclaimer /></PageTransition>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  // Check if we're past the launch date
  const launchDate = new Date("2026-01-15T00:00:00");
  const now = new Date();
  const isMaintenanceActive = MAINTENANCE_MODE && now < launchDate;

  if (isMaintenanceActive) {
    return <MaintenanceMode />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
