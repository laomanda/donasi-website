import { useState, useEffect, useRef } from "react";
import { useLang } from "../lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { indonesiaFlag, ukFlag } from "@/assets/brand";

interface AuthLayoutProps {
  children: React.ReactNode;
  noScroll?: boolean;
}

export function AuthLayout({ children, noScroll = false }: AuthLayoutProps) {
  const { locale, setLocale } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${noScroll ? "h-screen overflow-hidden" : "min-h-screen"} bg-slate-50 text-slate-900 antialiased font-sans`}>
      <div className={`relative ${noScroll ? "h-full" : "min-h-screen"} overflow-hidden`}>
        {/* Language Switcher Placeholder/Container */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-4 sm:right-8 sm:top-8">
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brandGreen-200"
            >
              <img
                src={locale === "id" ? indonesiaFlag : ukFlag}
                alt={locale === "id" ? "Indonesia" : "English"}
                className="h-4 w-6 rounded-sm object-cover"
              />
              <span className="hidden sm:inline">{locale === "id" ? "Indonesia" : "English"}</span>
              <FontAwesomeIcon icon={faGlobe} className="text-brandGreen-600 ml-1" />
              <FontAwesomeIcon icon={langOpen ? faCaretUp : faCaretDown} className="text-brandGreen-600 text-[10px]" />
            </button>
            <div
              className={`absolute right-0 top-full mt-2 min-w-[140px] rounded-xl bg-white text-slate-700 shadow-xl ring-1 ring-slate-100 transition ${langOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "pointer-events-none opacity-0 -translate-y-1"
                }`}
            >
              {[
                { code: "id" as const, label: "Indonesia", flag: indonesiaFlag },
                { code: "en" as const, label: "English", flag: ukFlag },
              ].map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLocale(opt.code);
                    setLangOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs transition first:rounded-t-xl last:rounded-b-xl ${locale === opt.code
                    ? "bg-brandGreen-50 border-l-4 border-brandGreen-500 text-slate-900 font-bold"
                    : "hover:bg-slate-50 text-slate-700 border-l-4 border-transparent"
                    }`}
                >
                  <img src={opt.flag} alt={opt.label} className="h-5 w-8 rounded-sm object-cover" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-brandGreen-200/25 blur-[130px]" />
          <div className="absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-brandGreen-300/20 blur-[130px]" />
        </div>

        <main className={`relative mx-auto flex ${noScroll ? "h-full py-4" : "min-h-screen py-10"} w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
