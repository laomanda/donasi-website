import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPhone, 
    faEnvelope, 
    faHandHoldingHeart, 
    faMagnifyingGlass, 
    faXmark 
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { PrayerBadge } from "../PrayerBadge";

interface TopBarProps {
    topbarClass: string;
    topbarTextClass: string;
    topbarIconClass: string;
    topbarLinkClass: string;
    topbarMutedClass: string;
    topbarDark: boolean;
    t: (key: string, fallback?: string) => string;
    phoneLink: string;
    phoneNumber: string;
    emailLink: string;
    emailText: string;
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    searchQuery: string;
    handleSearchChange: (val: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    searchFeedback: string | null;
    setSearchFeedback: (val: string | null) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    searchToggleClass: string;
    searchFormClass: string;
    searchInputClass: string;
    searchSubmitClass: string;
    searchCloseClass: string;
}

export function TopBar({
    topbarClass,
    topbarTextClass,
    topbarIconClass,
    topbarLinkClass,
    topbarMutedClass,
    topbarDark,
    t,
    phoneLink,
    phoneNumber,
    emailLink,
    emailText,
    searchOpen,
    setSearchOpen,
    searchQuery,
    handleSearchChange,
    handleSearch,
    searchFeedback,
    setSearchFeedback,
    searchInputRef,
    searchToggleClass,
    searchFormClass,
    searchInputClass,
    searchSubmitClass,
    searchCloseClass,
}: TopBarProps) {
    return (
        <div className={`relative z-[80] overflow-visible ${topbarClass}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className={`hidden lg:grid grid-cols-[minmax(0,1fr),auto] items-center gap-4 py-2 text-xs ${topbarTextClass}`}>
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
                        <Link to="/donate#rekening-resmi" className={`inline-flex items-center gap-2 ${topbarLinkClass}`}>
                            <FontAwesomeIcon icon={faHandHoldingHeart} className={topbarIconClass} />
                            {t("nav.donationAccount")}
                        </Link>
                        <div
                            className={`inline-flex items-center gap-2 font-semibold ml-6 ${topbarDark ? "text-white/70" : "text-slate-600"
                                }`}
                        >
                            <PrayerBadge variant={topbarDark ? "dark" : "light"} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden lg:flex items-center justify-end z-50 w-10 h-10">
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className={`${searchToggleClass} absolute right-0 transition-all duration-200 ${searchOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"}`}
                                aria-label={t("nav.search.submit")}
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>

                            {searchOpen && (
                                <form
                                    onSubmit={handleSearch}
                                    className={`${searchFormClass} absolute right-0 top-1/2 -translate-y-1/2 origin-right animate-in fade-in zoom-in-95 duration-200`}
                                >
                                    <input
                                        ref={searchInputRef}
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder={searchFeedback ? t("nav.search.notFound") : t("nav.search.placeholder")}
                                        list="landing-search-keywords"
                                        className={searchInputClass}
                                    />
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <button
                                            type="submit"
                                            className={searchSubmitClass}
                                            aria-label={t("nav.search.submit")}
                                        >
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[10px]" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setSearchFeedback(null);
                                            }}
                                            className={searchCloseClass}
                                            aria-label="Tutup"
                                        >
                                            <FontAwesomeIcon icon={faXmark} className="text-[12px]" />
                                        </button>
                                    </div>
                                </form>
                            )}
                            {searchOpen && searchFeedback && (
                                <div className="absolute right-0 top-full mt-3 rounded-xl border border-amber-200/50 bg-amber-50/90 backdrop-blur-sm px-4 py-2.5 text-xs font-semibold text-amber-800 shadow-lg whitespace-nowrap">
                                    {searchFeedback}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
