import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Language } from "@/lib/translations";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-custom";
import {
  LayoutDashboard,
  DollarSign,
  Sliders,
  Pencil,
  Settings as SettingsIcon,
  User,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { updateProfile, updateEmail } from "firebase/auth";

// ─── Sidebar icon ───
const SidebarIcon = ({
  icon: Icon,
  label,
  active,
  expanded,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 rounded-xl transition-all ${
      expanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center"
    } ${
      active
        ? "bg-red-100 text-red-500 shadow-sm"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {expanded && (
      <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-red-500" : "text-foreground"}`}>
        {label}
      </span>
    )}
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t, setLanguage: applyLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Profile states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");

  // Preference states
  const [currency, setCurrency] = useState("CAD");
  const [academicSystem, setAcademicSystem] = useState("semester");
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || "");
      setEmail(currentUser.email || "");

      const savedPreferences = localStorage.getItem("budgetly_preferences");
      if (savedPreferences) {
        const prefs = JSON.parse(savedPreferences);
        setCurrency(prefs.currency || "CAD");
        setAcademicSystem(prefs.academicSystem || "semester");
        setLanguage(prefs.language || "english");
        setSchool(prefs.school || "");
      }
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: fullName });
      }

      if (email !== currentUser.email && email) {
        try {
          await updateEmail(currentUser, email);
        } catch (error: any) {
          if (error.code === "auth/requires-recent-login") {
            toast.error("Please sign out and sign in again to change your email");
            setLoading(false);
            return;
          }
          throw error;
        }
      }

      const preferences = JSON.parse(localStorage.getItem("budgetly_preferences") || "{}");
      preferences.school = school;
      localStorage.setItem("budgetly_preferences", JSON.stringify(preferences));

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    const preferences = { currency, academicSystem, language, school };
    localStorage.setItem("budgetly_preferences", JSON.stringify(preferences));
    applyLanguage(language as Language);
    toast.success(t.common.saveChanges + "!");
  };

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* ── Left Sidebar ── */}
        <aside className={`border-r border-border bg-white flex flex-col items-center py-4 gap-2 sticky top-[57px] h-[calc(100vh-57px)] flex-shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-48 px-3" : "w-16"}`}>
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
          <SidebarIcon icon={Pencil} label={t.nav.edit} expanded={sidebarExpanded} onClick={() => navigate("/edit")} />
          <SidebarIcon icon={SettingsIcon} label={t.nav.settings} active expanded={sidebarExpanded} />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">{t.settings.title}</h1>
            <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {/* ── Profile card ── */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-base font-bold">{t.settings.profile}</h2>
              </div>

              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-red-50">
                    <img
                      src={
                        currentUser?.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          fullName || currentUser?.email || "User"
                        )}&size=200&background=ef4444&color=ffffff&bold=true`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.fullName}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* School */}
                <div>
                  <Label htmlFor="school" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.school}
                  </Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder={t.settings.schoolPlaceholder}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 text-sm font-semibold"
                  >
                    {loading ? t.common.saving : t.common.saveChanges}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Preferences card ── */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-base font-bold">{t.settings.preferences}</h2>
              </div>

              <div className="space-y-5">
                {/* Currency */}
                <div>
                  <Label htmlFor="currency" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.currency}
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">$</span>
                          <span>{currency}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAD">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">$</span>
                          <span>CAD</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="USD">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">$</span>
                          <span>USD</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="EUR">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">€</span>
                          <span>EUR</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="GBP">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">£</span>
                          <span>GBP</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Academic System */}
                <div>
                  <Label htmlFor="academicSystem" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.academicSystem}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">{t.settings.academicSystemDesc}</p>
                  <Select value={academicSystem} onValueChange={setAcademicSystem}>
                    <SelectTrigger id="academicSystem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">{t.settings.academicSemester}</SelectItem>
                      <SelectItem value="trimester">{t.settings.academicTrimester}</SelectItem>
                      <SelectItem value="quarter">{t.settings.academicQuarter}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <Label htmlFor="language" className="text-sm font-semibold mb-1.5 block">
                    {t.settings.language}
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">{t.settings.langEnglish}</SelectItem>
                      <SelectItem value="french">{t.settings.langFrench}</SelectItem>
                      <SelectItem value="spanish">{t.settings.langSpanish}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 text-sm font-semibold"
                  >
                    {t.common.saveChanges}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
