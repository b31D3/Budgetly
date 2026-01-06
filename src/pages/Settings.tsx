import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@/components/ui/select";
import { Sliders, Settings as SettingsIcon } from "lucide-react";
import { updateProfile, updateEmail } from "firebase/auth";

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

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

      // Load preferences from localStorage
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
      // Update display name if changed
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: fullName,
        });
      }

      // Update email if changed (requires re-authentication in production)
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

      // Save school to localStorage (not in Firebase Auth)
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
    const preferences = {
      currency,
      academicSystem,
      language,
      school,
    };

    localStorage.setItem("budgetly_preferences", JSON.stringify(preferences));
    toast.success("Preferences saved successfully!");
  };

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto">
          <div className="flex gap-8 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My finances
            </button>
            <button
              onClick={() => navigate("/scenarios")}
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
            >
              <Sliders className="w-5 h-5" />
              Scenarios
            </button>
            <button
              onClick={() => navigate("/calculator")}
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit inputs
            </button>
            <button
              className="flex items-center gap-2 px-4 py-4 border-b-2 transition-colors border-primary text-primary font-medium"
            >
              <SettingsIcon className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="container mx-auto px-12 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account & preference</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Profile picture</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Update picture
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-base font-semibold mb-2 block">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-semibold mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* School */}
              <div>
                <Label htmlFor="school" className="text-base font-semibold mb-2 block">
                  School
                </Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Enter your school name"
                  className="bg-white"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-lg"
                >
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* Preference Section */}
          <div className="bg-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Preference</h2>

            <div className="space-y-6">
              {/* Currency */}
              <div>
                <Label htmlFor="currency" className="text-base font-semibold mb-2 block">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="bg-white">
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
                <Label htmlFor="academicSystem" className="text-base font-semibold mb-2 block">
                  Academic System
                </Label>
                <p className="text-sm text-muted-foreground mb-2">School's academic schedule</p>
                <Select value={academicSystem} onValueChange={setAcademicSystem}>
                  <SelectTrigger id="academicSystem" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">Semester (Fall & Winter)</SelectItem>
                    <SelectItem value="trimester">Trimester (Fall, Winter & Spring)</SelectItem>
                    <SelectItem value="quarter">Quarter System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language" className="text-base font-semibold mb-2 block">
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-lg"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
