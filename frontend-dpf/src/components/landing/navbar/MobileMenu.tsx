import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faXmark, 
    faPhone, 
    faEnvelope, 
    faHandHoldingHeart, 
    faMagnifyingGlass, 
    faGlobe, 
    faGaugeHigh, 
    faRightToBracket 
} from "@fortawesome/free-solid-svg-icons";
import { PrayerBadge } from "../PrayerBadge";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { indonesiaFlag, ukFlag } from "@/assets/brand";
import { MusicToggle } from "./MusicToggle";

interface MobileMenuProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    t: (key: string, fallback?: string) => string;
    phoneLink: string;
    phoneNumber: string;
    emailLink: string;
    emailText: string;
    searchQuery: string;
    handleSearchChange: (val: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    searchFeedback: string | null;
    locale: "id" | "en";
    setLocale: (l: "id" | "en") => void;
    items: { label: string; href: string; icon: IconProp }[];
    location: { pathname: string };
    navigate: (path: string) => void;
    resolveUserDashboard: () => string | null;
}

export function MobileMenu({
    open,
    setOpen,
    t,
    phoneLink,
    phoneNumber,
    emailLink,
    emailText,
    searchQuery,
    handleSearchChange,
    handleSearch,
    searchFeedback,
    locale,
    setLocale,
    items,
    location,
    navigate,
    resolveUserDashboard,
}: MobileMenuProps) {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                onClick={() => setOpen(false)}
            />

            {/* Panel Menu Mobile */}
            <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-white rounded-b-[2rem] shadow-xl overflow-hidden animate-slide-down">
                <div className="max-h-[92dvh] overflow-y-auto">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-slate-800">{t("nav.menuTitle")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MusicToggle className="text-slate-500 hover:text-brandGreen-600" />
                            <button
                                onClick={() => setOpen(false)}
                                className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </div>

                    <div className="p-5 space-y-1">
                        <div className="mb-4">
                            <PrayerBadge />
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-brandGreen-600" />
                                {t("nav.phoneLabel")}:{" "}
                                <a
                                    href={phoneLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-slate-800"
                                >
                                    {phoneNumber}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-brandGreen-600" />
                                {t("nav.emailLabel")}:{" "}
                                <a href={emailLink} className="font-semibold text-slate-800">
                                    {emailText}
                                </a>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/donate#rekening-resmi");
                                }}
                                className="inline-flex items-center gap-2 font-semibold text-brandGreen-700"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                {t("nav.donationAccount")}
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 mb-2">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder={t("nav.search.placeholder")}
                                list="landing-search-keywords"
                                className="w-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brandGreen-600 text-white transition hover:bg-brandGreen-700"
                                aria-label={t("nav.search.submit")}
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                        </form>
                        {searchFeedback && (
                            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 mb-3">
                                {searchFeedback}
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-500 mb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faGlobe} className="text-brandGreen-600" />
                                {t("nav.language")}
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setLocale("id")}
                                    aria-label="Bahasa Indonesia"
                                    className={`h-7 w-10 rounded-md ${locale === "id" ? "bg-brandGreen-600 ring-1 ring-brandGreen-700" : "bg-white"}`}
                                >
                                    <img
                                        src={indonesiaFlag}
                                        alt="Indonesia"
                                        className="h-full w-full rounded-sm object-cover"
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocale("en")}
                                    aria-label="English"
                                    className={`h-7 w-10 rounded-md ${locale === "en" ? "bg-brandGreen-600 ring-1 ring-brandGreen-700" : "bg-white"}`}
                                >
                                    <img
                                        src={ukFlag}
                                        alt="English"
                                        className="h-full w-full rounded-sm object-cover"
                                    />
                                </button>
                            </div>
                        </div>

                        {items.map((it) => (
                            <button
                                key={it.href}
                                onClick={() => { setOpen(false); navigate(it.href); }}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition
                              ${location.pathname === it.href
                                        ? "bg-primary-50 text-primary-700 border border-primary-100"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                <FontAwesomeIcon icon={it.icon} className={`${location.pathname === it.href ? "text-primary-600" : "text-slate-400"} w-5`} />
                                {it.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-5 grid grid-cols-2 gap-3 border-t border-slate-100">
                        <button
                            onClick={() => {
                                setOpen(false);
                                const dashPath = resolveUserDashboard();
                                navigate(dashPath || "/login");
                            }}
                            className={`inline-flex justify-center items-center rounded-xl py-3 text-sm font-semibold text-white transition ${
                                resolveUserDashboard()
                                    ? "bg-slate-800 hover:bg-slate-900"
                                    : "border border-slate-200 bg-primary-600 hover:bg-primary-700"
                            }`}
                        >
                            <FontAwesomeIcon icon={resolveUserDashboard() ? faGaugeHigh : faRightToBracket} className="mr-2" />
                            {resolveUserDashboard() ? t("nav.dashboard") : t("nav.login")}
                        </button>

                        <button
                            onClick={() => { setOpen(false); navigate("/donate"); }}
                            className="inline-flex justify-center items-center rounded-xl bg-brandGreen-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brandGreen-700 transition"
                        >
                            <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-2" />
                            {t("nav.donate")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
