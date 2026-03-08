import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { indonesiaFlag, ukFlag } from "@/assets/brand";

interface DashboardLangSwitcherProps {
  locale: string;
  setLocale: (l: "id" | "en") => void;
  langOpen: boolean;
  setLangOpen: (o: boolean) => void;
}

export function DashboardLangSwitcher({ locale, setLocale, langOpen, setLangOpen }: DashboardLangSwitcherProps) {
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen, setLangOpen]);

  return (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen(!langOpen)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <img src={locale === "id" ? indonesiaFlag : ukFlag} alt={locale === "id" ? "ID" : "EN"} className="h-4 w-6 rounded-sm object-cover" />
        <span className="hidden sm:inline">{locale === "id" ? "ID" : "EN"}</span>
        <FontAwesomeIcon icon={faGlobe} className="text-brandGreen-600" />
        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${langOpen ? "rotate-180" : ""}`} />
      </button>

      {langOpen && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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
              className={`flex w-full items-center gap-3 px-4 py-3 text-xs font-bold transition ${
                locale === opt.code
                  ? "bg-slate-50 text-brandGreen-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <img src={opt.flag} alt={opt.label} className="h-4 w-6 rounded-sm object-cover" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
