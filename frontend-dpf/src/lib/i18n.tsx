import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "id" | "en";

type Translations = Record<Locale, Record<string, string>>;

const translations: Translations = {
    id: {},
    en: {},
};

type LangContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, fallback?: string) => string;
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = window.localStorage.getItem("dpf_lang");
        return saved === "en" ? "en" : "id";
    });

    const setLocale = (value: Locale) => {
        setLocaleState(value);
        window.localStorage.setItem("dpf_lang", value);
    };

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "dpf_lang") {
                setLocaleState(e.newValue === "en" ? "en" : "id");
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const t = (key: string, fallback?: string) => {
        const value = translations[locale][key];
        return value ?? fallback ?? key;
    };

    const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error("useLang must be used within LangProvider");
    return ctx;
};
