import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHandHoldingHeart,
    faRightToBracket,
    faGaugeHigh,
    faBars,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import { dpfWakaf } from "@/assets/brand";
import { useLandingNavbar } from "./useLandingNavbar";
import { NAV_ITEMS } from "./LandingNavbarShared";
import { TopBar } from "./TopBar";
import { MobileMenu } from "./MobileMenu";

export function LandingNavbar() {
    const {
        open, setOpen,
        locale, setLocale,
        langOpen, setLangOpen,
        langRef,
        navigate,
        location,
        heroMode,
        topbarDark,
        showWave,
        t,
        phoneNumber, phoneLink,
        emailText, emailLink,
        resolveUserDashboard
    } = useLandingNavbar();

    // Styles
    const heroGlassClass = "bg-slate-900/35";
    const navSurfaceClass = heroMode ? heroGlassClass : "bg-white/95";
    const topbarClass = topbarDark ? "text-white" : "text-slate-900";
    const topbarIconClass = topbarDark ? "text-white" : "text-brandGreen-600";
    const topbarLinkClass = topbarDark ? "font-semibold text-white" : "font-semibold text-slate-900 hover:text-primary-700";
    const topbarTextClass = topbarDark ? "text-white" : "text-slate-900";
    const topbarMutedClass = topbarDark ? "text-white/70" : "text-slate-700";
    
    const navShellClass = heroMode
        ? "border-b border-white/10 shadow-none"
        : `${location.pathname === "/" && !heroMode ? "border-b border-slate-100" : "border-b border-transparent"} shadow-[0_12px_30px_-22px_rgba(15,23,42,0.3)]`;
    
    const navItemActiveClass = heroMode
        ? "text-white bg-white/15 ring-1 ring-white/20"
        : "text-primary-700 bg-primary-50 ring-1 ring-primary-100/60";
    
    const navItemIdleClass = heroMode
        ? "text-white/80 hover:text-white hover:bg-white/10"
        : "text-slate-600 hover:text-primary-700 hover:bg-slate-50/80";
    
    const navIconClass = heroMode ? "text-white/70" : "text-slate-400";
    const brandTitleClass = heroMode ? "text-white" : "text-slate-800";
    const brandTaglineClass = heroMode ? "text-white/70" : "text-slate-500";
    
    const langButtonClass = heroMode
        ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:border-white/40"
        : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-brandGreen-200";
    
    const langIconClass = heroMode ? "text-white/80" : "text-brandGreen-600";
    const langDropdownClass = heroMode
        ? `${heroGlassClass} text-white shadow-xl ring-1 ring-white/15 backdrop-blur`
        : "bg-white text-slate-700 shadow-xl ring-1 ring-slate-100";
    
    const langOptionClass = heroMode ? "text-white/90" : "text-slate-700";
    const langOptionActiveClass = heroMode ? "bg-white/15 border-l-4 border-white/70" : "bg-brandGreen-50 border-l-4 border-brandGreen-500";
    const langOptionHoverClass = heroMode ? "hover:bg-white/10" : "hover:bg-slate-50";
    
    const loginButtonClass = heroMode
        ? "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white/20 transition-colors"
        : "inline-flex items-center justify-center rounded-full border border-slate-200 bg-primary-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:border-slate-300 hover:bg-primary-700 transition-colors";
    
    const dashboardButtonClass = heroMode
        ? "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white/20 transition-colors"
        : "inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-800 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-900 transition-colors";
    
    const donateButtonClass = heroMode
        ? "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white/20 transition-colors"
        : "inline-flex items-center justify-center rounded-full bg-brandGreen-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brandGreen-700 transition-colors";

    const items = useMemo(
        () =>
            NAV_ITEMS.map((item) => ({
                ...item,
                label: item.label[locale as "id" | "en"] ?? item.label.id,
            })),
        [locale]
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans overflow-visible">
            <div className={`relative overflow-visible backdrop-blur-sm ${navSurfaceClass}`}>
                <TopBar 
                    topbarClass={topbarClass}
                    topbarTextClass={topbarTextClass}
                    topbarIconClass={topbarIconClass}
                    topbarLinkClass={topbarLinkClass}
                    topbarMutedClass={topbarMutedClass}
                    topbarDark={topbarDark}
                    heroMode={heroMode}
                    t={t}
                    phoneLink={phoneLink}
                    phoneNumber={phoneNumber}
                    emailLink={emailLink}
                    emailText={emailText}
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

                <div className="relative">
                    <div className={`relative z-[20] ${navShellClass}`}>
                        <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
                            <Link to="/" className="flex items-center gap-3 group">
                                <span className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                                    <img
                                        src={dpfWakaf}
                                        alt="DPF"
                                        className="h-full w-full object-contain p-1"
                                    />
                                </span>
                                <div className="leading-tight">
                                    <p className={`font-heading text-sm sm:text-base font-bold tracking-tight ${brandTitleClass}`}>
                                        DPF WAKAF
                                    </p>
                                    <p className={`font-accent text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase ${brandTaglineClass}`}>
                                        {t("nav.tagline")}
                                    </p>
                                </div>
                            </Link>

                            <nav className="hidden lg:flex items-center gap-1">
                                {items.map((it) => (
                                    <NavLink
                                        key={it.href}
                                        to={it.href}
                                        className={({ isActive }) => `
                                            flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200
                                            ${isActive ? navItemActiveClass : navItemIdleClass}
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <FontAwesomeIcon
                                                    icon={it.icon}
                                                    className={`text-[13px] ${isActive ? (heroMode ? "text-white" : "text-primary-600") : navIconClass}`}
                                                />
                                                <span>{it.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="hidden lg:flex items-center gap-2.5 overflow-visible">
                                {(() => {
                                    const dashPath = resolveUserDashboard();
                                    if (dashPath) {
                                        return (
                                            <NavLink
                                                to={dashPath}
                                                className={dashboardButtonClass}
                                            >
                                                <FontAwesomeIcon icon={faGaugeHigh} className="mr-2 text-xs" />
                                                {t("nav.dashboard")}
                                            </NavLink>
                                        );
                                    }
                                    return (
                                        <NavLink
                                            to="/login"
                                            className={loginButtonClass}
                                        >
                                            <FontAwesomeIcon icon={faRightToBracket} className="mr-2 text-xs" />
                                            {t("nav.login")}
                                        </NavLink>
                                    );
                                })()}
                                <button
                                    type="button"
                                    onClick={() => navigate("/donate")}
                                    className={donateButtonClass}
                                >
                                    <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-2" />
                                    {t("nav.donate")}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                                aria-label={open ? "Tutup menu navigasi / Close navigation menu" : "Buka menu navigasi / Open navigation menu"}
                            >
                                <FontAwesomeIcon icon={open ? faXmark : faBars} className="text-lg" />
                            </button>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-x-0 -bottom-[1px] z-0 overflow-hidden transition-all duration-500 ease-in-out ${showWave ? "max-h-[20px] translate-y-0 opacity-100" : "max-h-0 translate-y-2 opacity-0"
                            }`}
                    >
                        <svg
                            className="block w-full h-[18px]"
                            viewBox="0 0 1440 18"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0 0H1440V9C120 15,240 3,360 9C480 15,600 3,720 9C840 15,960 3,1080 9C1200 15,1320 3,1440 9V0Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <MobileMenu 
                open={open}
                setOpen={setOpen}
                t={t}
                phoneLink={phoneLink}
                phoneNumber={phoneNumber}
                emailLink={emailLink}
                emailText={emailText}
                locale={locale}
                setLocale={setLocale}
                items={items}
                location={location}
                navigate={navigate}
                resolveUserDashboard={resolveUserDashboard}
            />
        </header>
    );
}
