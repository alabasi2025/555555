import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, languages, t as translate, formatNumber, formatCurrency, formatDate, formatDateTime } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'rtl' | 'ltr';
  t: (key: string) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (date: Date) => string;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'power-station-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_KEY) as Language;
      if (stored && languages[stored]) {
        return stored;
      }
      // اكتشاف لغة المتصفح
      const browserLang = navigator.language.split('-')[0] as Language;
      if (languages[browserLang]) {
        return browserLang;
      }
    }
    return 'ar'; // الافتراضي: العربية
  });

  const direction = languages[language].direction;

  // تطبيق اتجاه اللغة على الصفحة
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // تحديث الخط حسب اللغة
    if (language === 'ar') {
      document.body.style.fontFamily = '"Cairo", "Tajawal", sans-serif';
    } else {
      document.body.style.fontFamily = '"Inter", sans-serif';
    }

    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    if (languages[lang]) {
      setLanguageState(lang);
    }
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    direction,
    t: (key: string) => translate(key as any, language),
    formatNumber: (value: number) => formatNumber(value, language),
    formatCurrency: (value: number) => formatCurrency(value, language),
    formatDate: (date: Date) => formatDate(date, language),
    formatDateTime: (date: Date) => formatDateTime(date, language),
    availableLanguages: languages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default LanguageContext;
