import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard,
  DollarSign,
  Sliders,
  Pencil,
  Settings,
} from "lucide-react";

const tabs = [
  { key: "dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { key: "finances", icon: DollarSign, path: "/my-finances" },
  { key: "scenarios", icon: Sliders, path: "/scenarios" },
  { key: "edit", icon: Pencil, path: "/edit" },
  { key: "settings", icon: Settings, path: "/settings" },
] as const;

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const labelMap: Record<string, string> = {
    dashboard: t.nav.dashboard,
    finances: t.nav.finances,
    scenarios: t.nav.scenarios,
    edit: t.nav.edit,
    settings: t.nav.settings,
  };

  const getActive = () => {
    const path = location.pathname;
    if (path === "/my-finances" || path === "/dashboard?tab=finances") return "finances";
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/scenarios")) return "scenarios";
    if (path.startsWith("/edit")) return "edit";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  };

  const active = getActive();

  return (
    <nav className="lg:hidden bg-white border-b border-border">
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[56px] transition-colors ${
                isActive
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-gray-400"}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-red-500" : "text-gray-400"}`}>
                {labelMap[tab.key]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
