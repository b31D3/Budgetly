import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const prefs = localStorage.getItem("budgetly_preferences");
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.language && parsed.language in translations) {
          return parsed.language as Language;
        }
      }
    } catch {}
    return "english";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Persist alongside other preferences
    try {
      const prefs = JSON.parse(localStorage.getItem("budgetly_preferences") || "{}");
      prefs.language = lang;
      localStorage.setItem("budgetly_preferences", JSON.stringify(prefs));
    } catch {}
  };

  // Re-sync if localStorage changes externally (e.g. Settings page writes directly)
  useEffect(() => {
    const sync = () => {
      try {
        const prefs = JSON.parse(localStorage.getItem("budgetly_preferences") || "{}");
        if (prefs.language && prefs.language in translations) {
          setLanguageState(prefs.language as Language);
        }
      } catch {}
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
