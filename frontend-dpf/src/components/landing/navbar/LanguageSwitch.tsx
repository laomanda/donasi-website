import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faGlobe, 
    faCaretDown, 
    faCaretUp 
} from "@fortawesome/free-solid-svg-icons";
import { indonesiaFlag, ukFlag } from "@/assets/brand";

interface LanguageSwitchProps {
    langRef: React.RefObject<HTMLDivElement | null>;
    langOpen: boolean;
    setLangOpen: React.Dispatch<React.SetStateAction<boolean>>;
    locale: "id" | "en";
    setLocale: (locale: "id" | "en") => void;
    langButtonClass: string;
    langIconClass: string;
    langDropdownClass: string;
    langOptionClass: string;
    langOptionActiveClass: string;
    langOptionHoverClass: string;
}

export function LanguageSwitch({
    langRef,
    langOpen,
    setLangOpen,
    locale,
    setLocale,
    langButtonClass,
    langIconClass,
    langDropdownClass,
    langOptionClass,
    langOptionActiveClass,
    langOptionHoverClass,
}: LanguageSwitchProps) {
    return (
        <div className="relative z-[70]" ref={langRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setLangOpen((v) => !v);
                }}
                className={langButtonClass}
            >
                <img
                    src={locale === "id" ? indonesiaFlag : ukFlag}
                    alt={locale === "id" ? "Indonesia" : "English"}
                    className="h-5 w-7 rounded-sm object-cover"
                />
                <FontAwesomeIcon icon={faGlobe} className={langIconClass} />
                <FontAwesomeIcon icon={langOpen ? faCaretUp : faCaretDown} className={langIconClass} />
            </button>
            <div
                className={`absolute right-0 top-full mt-3 min-w-[160px] rounded-xl transition ${langDropdownClass} ${langOpen ? "opacity-100 translate-y-0 pointer-events-auto z-[80]" : "pointer-events-none opacity-0 -translate-y-1 z-0"
                    }`}
                onClick={(e) => e.stopPropagation()}
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
                        className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition ${langOptionClass} ${locale === opt.code ? langOptionActiveClass : langOptionHoverClass
                            }`}
                    >
                        <img src={opt.flag} alt={opt.label} className="h-6 w-9 rounded-sm object-cover" />
                        <span className="font-semibold">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
