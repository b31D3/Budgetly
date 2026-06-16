import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CalculatorFormImproved from "@/components/CalculatorFormImproved";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserCalculations } from "@/services/calculatorService";
import {
  LayoutDashboard,
  DollarSign,
  Sliders,
  Pencil,
  Settings,
  ChevronRight,
} from "lucide-react";
import SidebarIcon from "@/components/SidebarIcon";

const Calculator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const checkUserCalculations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        await getUserCalculations(currentUser.uid);
      } catch (error) {
        console.error("Error checking calculations:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserCalculations();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <BottomNav />

      <div className="flex flex-1">
        {/* ── Left Sidebar ── */}
        <aside className={`hidden lg:flex border-r border-border bg-white flex-col items-center py-4 gap-2 sticky top-[57px] h-[calc(100vh-57px)] flex-shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-48 px-3" : "w-16"}`}>
          {/* Expand toggle — top */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`mb-1 w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ${sidebarExpanded ? "self-end" : ""}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarExpanded ? "rotate-180" : ""}`} />
          </button>
          <SidebarIcon icon={LayoutDashboard} label={t.nav.dashboard} expanded={sidebarExpanded} onClick={() => navigate("/dashboard")} />
          <SidebarIcon icon={DollarSign} label={t.nav.finances} expanded={sidebarExpanded} onClick={() => navigate("/dashboard?tab=finances")} />
          <SidebarIcon icon={Sliders} label={t.nav.scenarios} expanded={sidebarExpanded} onClick={() => navigate("/scenarios")} />
          <SidebarIcon icon={Pencil} label={t.nav.edit} active expanded={sidebarExpanded} />
          <SidebarIcon icon={Settings} label={t.nav.settings} expanded={sidebarExpanded} onClick={() => navigate("/settings")} />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="px-8 py-8">
              <p className="text-sm text-muted-foreground">{t.common.loading}</p>
            </div>
          ) : (
            <CalculatorFormImproved editMode={true} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Calculator;
