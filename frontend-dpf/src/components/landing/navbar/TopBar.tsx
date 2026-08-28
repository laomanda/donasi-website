import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPhone, 
    faEnvelope 
} from "@fortawesome/free-solid-svg-icons";
import { PrayerBadge } from "../PrayerBadge";
import { MusicToggle } from "./MusicToggle";
import { LanguageSwitch } from "./LanguageSwitch";

interface TopBarProps {
    topbarClass: string;
    topbarTextClass: string;
    topbarIconClass: string;
    topbarLinkClass: string;
    topbarMutedClass: string;
    topbarDark: boolean;
    heroMode: boolean;
    t: (key: string, fallback?: string) => string;
    phoneLink: string;
    phoneNumber: string;
    emailLink: string;
    emailText: string;
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

export function TopBar({
    topbarClass,
    topbarTextClass,
    topbarIconClass,
    topbarLinkClass,
    topbarMutedClass,
    topbarDark,
    heroMode,
    t,
    phoneLink,
    phoneNumber,
    emailLink,
    emailText,
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
}: TopBarProps) {
    return (
        <div className={`relative z-[80] overflow-visible ${topbarClass}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className={`hidden lg:flex items-center justify-between py-2 text-xs ${topbarTextClass}`}>
                    {/* Left: Phone, Email, Time */}
                    <div className="flex min-w-0 flex-wrap items-center gap-5">
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} className={topbarIconClass} />
                            {t("nav.phoneLabel")}:{" "}
                            <a
                                href={phoneLink}
                                target="_blank"
                                rel="noreferrer"
                                className={topbarLinkClass}
                            >
                                {phoneNumber}
                            </a>{" "}
                            <span className={topbarMutedClass}>({t("nav.callCenter")})</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className={topbarIconClass} />
                            {t("nav.emailLabel")}:{" "}
                            <a href={emailLink} className={topbarLinkClass}>
                                {emailText}
                            </a>
                        </span>
                        <div
                            className={`inline-flex items-center gap-2 font-semibold ${topbarDark ? "text-white/70" : "text-slate-600"}`}
                        >
                            <PrayerBadge variant={topbarDark ? "dark" : "light"} />
                        </div>
                    </div>

                    {/* Right: Music toggle & Language switch (above Masuk & Donasi buttons) */}
                    <div className="flex items-center gap-2 overflow-visible">
                        <MusicToggle 
                            className={heroMode 
                                ? "text-white/80 hover:text-white hover:bg-white/10" 
                                : "text-slate-500 hover:text-primary-700 hover:bg-slate-50"} 
                        />
                        <LanguageSwitch 
                            langRef={langRef}
                            langOpen={langOpen}
                            setLangOpen={setLangOpen}
                            locale={locale}
                            setLocale={setLocale}
                            langButtonClass={langButtonClass}
                            langIconClass={langIconClass}
                            langDropdownClass={langDropdownClass}
                            langOptionClass={langOptionClass}
                            langOptionActiveClass={langOptionActiveClass}
                            langOptionHoverClass={langOptionHoverClass}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}




