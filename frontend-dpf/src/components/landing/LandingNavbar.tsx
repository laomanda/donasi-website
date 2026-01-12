import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
    faBars,
    faXmark,
    faHandHoldingHeart,
    faRightToBracket,
    faHouse,
    faHandsHoldingCircle,
    faHeart,
    faBookOpen,
    faCircleInfo,
    faMagnifyingGlass,
    faPhone,
    faEnvelope,
    faGlobe,
    faCaretDown,
    faCaretUp
} from "@fortawesome/free-solid-svg-icons";

import dpfLogo from "../../brand/dpf-icon.png";
import { useLang } from "../../lib/i18n";
import { PrayerBadge } from "./PrayerBadge";

type NavItem = { label: { id: string; en: string }; href: string; icon: IconProp };

const NAV_ITEMS: NavItem[] = [
    { label: { id: "Beranda", en: "Home" }, href: "/", icon: faHouse },
    { label: { id: "Layanan", en: "Services" }, href: "/layanan", icon: faHandsHoldingCircle },
    { label: { id: "Program", en: "Programs" }, href: "/program", icon: faHeart },
    { label: { id: "Literasi", en: "Literacy" }, href: "/literasi", icon: faBookOpen },
    { label: { id: "Tentang Kami", en: "About Us" }, href: "/tentang-kami", icon: faCircleInfo },
];

const SEARCH_ITEMS = [
    {
        href: "/",
        labels: { id: "Beranda", en: "Home" },
        keywords: [
            "beranda",
            "home",
            "dpf",
            "djalaludin pane foundation",
            "pintu pemberdayaan",
            "pemberdayaan",
            "amanah",
            "profesional",
            "katalog kebaikan"
        ],
    },
    {
        href: "/program",
        labels: { id: "Program", en: "Programs" },
        keywords: ["program", "programs", "katalog", "pintu", "unggulan", "mitra", "partner"],
    },
    {
        href: "/donate",
        labels: { id: "Donasi", en: "Donate" },
        keywords: ["donasi", "donate", "donation"],
    },
    {
        href: "/literasi",
        labels: { id: "Literasi", en: "Literacy" },
        keywords: ["literasi", "literacy", "artikel", "articles", "berita", "konten"],
    },
    {
        href: "/layanan",
        labels: { id: "Layanan", en: "Services" },
        keywords: ["layanan", "services"],
    },
    {
        href: "/tentang-kami",
        labels: { id: "Tentang Kami", en: "About Us" },
        keywords: ["tentang", "about"],
    },
    {
        href: "/konsultasi",
        labels: { id: "Konsultasi ZISWAF", en: "ZISWAF Consultation" },
        keywords: ["konsultasi", "consultation", "ziswaf"],
    },
    {
        href: "/jemput-zakat",
        labels: { id: "Jemput Zakat", en: "Pickup Zakat" },
        keywords: ["jemput", "pickup", "zakat"],
    },
    {
        href: "/konfirmasi-donasi",
        labels: { id: "Konfirmasi Donasi", en: "Donation Confirmation" },
        keywords: ["konfirmasi", "confirmation", "transfer"],
    },
    {
        href: "/cara-donasi",
        labels: { id: "Cara Donasi", en: "How to Donate" },
        keywords: ["cara", "how", "donasi"],
    },
];

// Index konten statis landing untuk penelusuran bebas (tanpa dropdown)
const SEARCH_INDEX: { href: string; corpus: string }[] = [
    {
        href: "/",
        corpus: `
            Djalaludin Pane Foundation
            Pintu pemberdayaan
            Amanah profesional
            Katalog kebaikan
            Mulai donasi
            Lihat program
            Program unggulan
            Mitra
            Bank rekening
            Rekening donasi
            Artikel terbaru
            Program terbaru
        `,
    },
    {
        href: "/program",
        corpus: `
            Program unggulan
            Zakat
            Donasi
            Beasiswa
            Campaign sosial
            Mitra
            Partner
            Program aktif
            Program nonaktif
            Donasi program
        `,
    },
    {
        href: "/layanan",
        corpus: `
            Layanan
            Jemput Zakat
            Konfirmasi Donasi
            Konsultasi ZISWAF
            Konsultasi ziswaf
            Jemput zakat ke lokasi
            Donasi langsung
        `,
    },
    {
        href: "/donate",
        corpus: `
            Donasi online
            Midtrans snap
            Transfer bank
            Rekening donasi
            Donasi umum
            Pilih nominal
            Rekening resmi
            Tujuan transfer
        `,
    },
    {
        href: "/literasi",
        corpus: `
            Literasi
            Artikel
            Berita
            Konten edukasi
            Baca selengkapnya
            Penulis
            Kategori
        `,
    },
    {
        href: "/konsultasi",
        corpus: `
            Konsultasi
            Konsultasi ZISWAF
            Tanya zakat infak sedekah wakaf
            Konsultasi ziswaf
            Hubungi kami
        `,
    },
    {
        href: "/jemput-zakat",
        corpus: `
            Jemput zakat
            Pickup zakat
            Penjemputan donasi
            Antar jemput
            Jadwalkan penjemputan
        `,
    },
    {
        href: "/tentang-kami",
        corpus: `
            Tentang kami
            Profil
            Struktur
            Amanah profesional
            Sejarah
            Visi misi
            Mitra
        `,
    },
    {
        href: "/konfirmasi-donasi",
        corpus: `
            Konfirmasi donasi
            Upload bukti transfer
            Verifikasi donasi
        `,
    },
    {
        href: "/program-detail",
        corpus: `
            Detail program
            Progress donasi
            Target donasi
        `,
    },
];

const COPY = {
    id: {
        phoneLabel: "No telepon",
        callCenter: "Call Center",
        emailLabel: "Email",
        donationAccount: "Rekening Donasi",
        searchPlaceholder: "Cari program, layanan, atau topik...",
        searchButton: "Cari",
        searchNotFound: "Data yang anda cari tidak ditemukan.",
        language: "Bahasa",
        menuTitle: "Menu",
        currentTime: "Waktu saat ini",
        login: "Masuk",
        donate: "Donasi",
        tagline: "Amanah | Profesional",
    },
    en: {
        phoneLabel: "Phone",
        callCenter: "Call Center",
        emailLabel: "Email",
        donationAccount: "Donation Account",
        searchPlaceholder: "Search programs, services, or topics...",
        searchButton: "Search",
        searchNotFound: "No matching data found.",
        language: "Language",
        menuTitle: "Menu",
        currentTime: "Current time",
        login: "Login",
        donate: "Donate",
        tagline: "Trust | Professional",
    },
};

export function LandingNavbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { locale, setLocale } = useLang();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isLanding = location.pathname === "/";
    const heroMode = isLanding && !scrolled;
    const topbarDark = heroMode;
    const heroGlassClass = "bg-slate-900/35";
    const navSurfaceClass = heroMode ? heroGlassClass : "bg-white/95";
    const topbarClass = topbarDark ? "text-white" : "text-slate-900";
    const topbarIconClass = topbarDark ? "text-white" : "text-brandGreen-600";
    const topbarLinkClass = topbarDark ? "font-semibold text-white" : "font-semibold text-slate-900 hover:text-primary-700";
    const topbarTextClass = topbarDark ? "text-white" : "text-slate-900";
    const topbarMutedClass = topbarDark ? "text-white/70" : "text-slate-700";
    const searchToggleClass = topbarDark
        ? "inline-flex h-10 w-10 items-center justify-center rounded-full text-white bg-white/15 ring-1 ring-white/20 hover:bg-white/25 transition"
        : "inline-flex h-10 w-10 items-center justify-center rounded-full text-white bg-brandGreen-600 hover:bg-brandGreen-700 transition";
    const searchFormClass = topbarDark
        ? "flex h-10 w-[360px] items-center gap-2 rounded-md bg-white/10 px-3 ring-1 ring-white/20 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.4)] backdrop-blur"
        : "flex h-10 w-[360px] items-center gap-2 rounded-md bg-white/95 px-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]";
    const searchInputClass = topbarDark
        ? "w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/60 focus:outline-none border-b-2 border-white/40 pb-1"
        : "w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none border-b-2 border-primary-500/70 pb-1";
    const searchSubmitClass = topbarDark
        ? "inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-white hover:bg-white/30"
        : "inline-flex h-8 w-8 items-center justify-center rounded-md bg-brandGreen-600 text-white shadow-[0_6px_16px_-12px_rgba(22,101,52,0.45)] hover:bg-brandGreen-700";
    const searchCloseClass = topbarDark
        ? "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white transition"
        : "inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:text-rose-600 transition";
    const navShellClass = heroMode
        ? "border-b border-white/10 shadow-none"
        : `${scrolled ? "border-b border-slate-100" : "border-b border-transparent"} shadow-[0_12px_30px_-22px_rgba(15,23,42,0.3)]`;
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
        ? "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-white/20 transition-colors"
        : "inline-flex items-center justify-center rounded-full border border-slate-200 bg-primary-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:border-slate-300 hover:bg-primary-700 transition-colors";
    const donateButtonClass = heroMode
        ? "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-white/20 transition-colors"
        : "inline-flex items-center justify-center rounded-full bg-brandGreen-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brandGreen-700 transition-colors";
    const showWave = !heroMode && !scrolled;

    const items = useMemo(
        () =>
            NAV_ITEMS.map((item) => ({
                ...item,
                label: item.label[locale],
            })),
        [locale]
    );
    const t = COPY[locale];
    const searchOptions = useMemo(() => SEARCH_ITEMS.map((item) => item.labels[locale]), [locale]);

    // Scroll handler: Wave hilang saat discroll agar bersih
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Handle Mobile Menu Escape
    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onEsc);

        return () => {
            document.body.style.overflow = "unset";
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    useEffect(() => {
        if (!searchOpen) return;
        const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
        return () => window.clearTimeout(id);
    }, [searchOpen]);

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

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchFeedback) setSearchFeedback(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchQuery.trim().toLowerCase();
        if (!term) return;

        const matchItem = SEARCH_ITEMS.find((item) => {
            const label = item.labels[locale].toLowerCase();
            const matchLabel = label.includes(term);
            const matchKeyword = item.keywords.some((keyword) => keyword.toLowerCase().includes(term));
            return matchLabel || matchKeyword;
        });

        const matchCorpus = SEARCH_INDEX.find((entry) => entry.corpus.toLowerCase().includes(term));

        const targetHref = matchItem?.href || matchCorpus?.href;

        if (!targetHref) {
            setSearchFeedback(t.searchNotFound);
            setSearchQuery(t.searchNotFound);
            return;
        }

        navigate(targetHref);
        setOpen(false);
        setSearchOpen(false);
        setSearchFeedback(null);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full font-sans overflow-visible">
            <div className={`relative overflow-visible backdrop-blur-sm ${navSurfaceClass}`}>
                <div className={`relative z-[80] overflow-visible ${topbarClass}`}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className={`hidden lg:grid grid-cols-[minmax(0,1fr),auto] items-center gap-4 py-2 text-xs ${topbarTextClass}`}>
                            <div className="flex min-w-0 flex-wrap items-center gap-5">
                                <span className="inline-flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPhone} className={topbarIconClass} />
                                    {t.phoneLabel}:{" "}
                                    <a
                                        href="https://wa.me/6281235262651"
                                        target="_blank"
                                        rel="noreferrer"
                                        className={topbarLinkClass}
                                    >
                                        0812-3526-2651
                                    </a>{" "}
                                    <span className={topbarMutedClass}>({t.callCenter})</span>
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <FontAwesomeIcon icon={faEnvelope} className={topbarIconClass} />
                                    {t.emailLabel}:{" "}
                                    <a href="mailto:info@dpf.or.id" className={topbarLinkClass}>
                                        info@dpf.or.id
                                    </a>
                                </span>
                                <Link to="/donate" className={`inline-flex items-center gap-2 ${topbarLinkClass}`}>
                                    <FontAwesomeIcon icon={faHandHoldingHeart} className={topbarIconClass} />
                                    {t.donationAccount}
                                </Link>
                                <div
                                    className={`inline-flex items-center gap-2 font-semibold ml-6 ${
                                        topbarDark ? "text-white/70" : "text-slate-600"
                                    }`}
                                >
                                    <PrayerBadge variant={topbarDark ? "dark" : "light"} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative hidden lg:flex items-center z-50">
                                    {!searchOpen ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearchOpen(true)}
                                            className={searchToggleClass}
                                            aria-label={t.searchButton}
                                        >
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={handleSearch}
                                            className={searchFormClass}
                                        >
                                            <input
                                                ref={searchInputRef}
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                            placeholder={searchFeedback ? t.searchNotFound : t.searchPlaceholder}
                                                list="landing-search-keywords"
                                                className={searchInputClass}
                                            />
                                            <button
                                                type="submit"
                                                className={searchSubmitClass}
                                                aria-label={t.searchButton}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} />
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
                                                <FontAwesomeIcon icon={faXmark} className="text-base" />
                                            </button>
                                        </form>
                                    )}
                                    {searchOpen && searchFeedback && (
                                        <div className="absolute right-0 top-full mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 shadow-sm">
                                            {searchFeedback}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className={`relative z-[20] ${navShellClass}`}>
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                            <Link to="/" className="flex items-center gap-3 group">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                                    <img
                                        src={dpfLogo}
                                        alt="DPF"
                                        className="h-full w-full object-contain p-1.5"
                                    />
                                </span>
                                <div className="leading-tight">
                                    <p className={`font-heading text-sm font-bold tracking-tight ${brandTitleClass}`}>
                                        DPF WAKAF
                                    </p>
                                    <p className={`font-accent text-[10px] font-bold tracking-[0.1em] uppercase ${brandTaglineClass}`}>
                                        {t.tagline}
                                    </p>
                                </div>
                            </Link>

                            <nav className="hidden lg:flex items-center gap-2">
                                {items.map((it) => (
                                    <NavLink
                                        key={it.href}
                                        to={it.href}
                                        className={({ isActive }) => `
                                            flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200
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

                            <div className="hidden lg:flex items-center gap-3 overflow-visible">
                                {/* Language Switch (dipindah ke sisi kanan) */}
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
                                            src={locale === "id" ? "/brand/Indonesia.svg" : "/brand/United-Kingdom.svg"}
                                            alt={locale === "id" ? "Indonesia" : "English"}
                                            className="h-5 w-7 rounded-sm object-cover"
                                        />
                                        <FontAwesomeIcon icon={faGlobe} className={langIconClass} />
                                        <FontAwesomeIcon icon={langOpen ? faCaretUp : faCaretDown} className={langIconClass} />
                                    </button>
                                    <div
                                        className={`absolute right-0 top-full mt-3 min-w-[160px] rounded-xl transition ${langDropdownClass} ${
                                            langOpen ? "opacity-100 translate-y-0 pointer-events-auto z-[80]" : "pointer-events-none opacity-0 -translate-y-1 z-0"
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {[
                                            { code: "id" as const, label: "Indonesia", flag: "/brand/Indonesia.svg" },
                                            { code: "en" as const, label: "English", flag: "/brand/United-Kingdom.svg" },
                                        ].map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onClick={() => {
                                                    setLocale(opt.code);
                                                    setLangOpen(false);
                                                }}
                                                className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition ${langOptionClass} ${
                                                    locale === opt.code ? langOptionActiveClass : langOptionHoverClass
                                                }`}
                                            >
                                                <img src={opt.flag} alt={opt.label} className="h-6 w-9 rounded-sm object-cover" />
                                                <span className="font-semibold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <NavLink
                                    to="/login"
                                    className={loginButtonClass}
                                >
                                    <FontAwesomeIcon icon={faRightToBracket} className="mr-2 text-xs" />
                                    {t.login}
                                </NavLink>
                                <button
                                    type="button"
                                    onClick={() => navigate("/donate")}
                                    className={donateButtonClass}
                                >
                                    <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-2" />
                                    {t.donate}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                            >
                                <FontAwesomeIcon icon={open ? faXmark : faBars} className="text-lg" />
                            </button>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-x-0 -bottom-[1px] z-0 overflow-hidden transition-all duration-500 ease-in-out ${
                            showWave ? "max-h-[20px] translate-y-0 opacity-100" : "max-h-0 translate-y-2 opacity-0"
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

            <datalist id="landing-search-keywords">
                {searchOptions.map((label) => (
                    <option key={label} value={label} />
                ))}
            </datalist>

            {/* --- Mobile Dropdown Menu --- */}
            {open && (
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
                                <span className="font-heading font-bold text-slate-800">{t.menuTitle}</span>
                             </div>
                             <button
                                onClick={() => setOpen(false)}
                                className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                            >
                                 <FontAwesomeIcon icon={faXmark} />
                             </button>
                        </div>

                        <div className="p-5 space-y-1">
                             <div className="mb-4">
                                 <PrayerBadge />
                             </div>

                             <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 space-y-2 mb-4">
                                 <div className="flex items-center gap-2">
                                     <FontAwesomeIcon icon={faPhone} className="text-brandGreen-600" />
                                     {t.phoneLabel}:{" "}
                                     <a
                                         href="https://wa.me/6281235262651"
                                         target="_blank"
                                         rel="noreferrer"
                                         className="font-semibold text-slate-800"
                                     >
                                         0812-3526-2651
                                     </a>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <FontAwesomeIcon icon={faEnvelope} className="text-brandGreen-600" />
                                     {t.emailLabel}:{" "}
                                     <a href="mailto:info@dpf.or.id" className="font-semibold text-slate-800">
                                         info@dpf.or.id
                                     </a>
                                 </div>
                                 <button
                                     type="button"
                                     onClick={() => {
                                         setOpen(false);
                                         navigate("/donate");
                                     }}
                                     className="inline-flex items-center gap-2 font-semibold text-brandGreen-700"
                                 >
                                     <FontAwesomeIcon icon={faHandHoldingHeart} />
                                     {t.donationAccount}
                                 </button>
                             </div>

                             <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 mb-2">
                                 <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                                 <input
                                     value={searchQuery}
                                     onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder={t.searchPlaceholder}
                                     list="landing-search-keywords"
                                     className="w-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                 />
                                 <button
                                     type="submit"
                                     className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brandGreen-600 text-white transition hover:bg-brandGreen-700"
                                     aria-label={t.searchButton}
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
                                     {t.language}
                                 </div>
                                 <div className="flex items-center gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-100">
                                     <button
                                         type="button"
                                         onClick={() => setLocale("id")}
                                         aria-label="Bahasa Indonesia"
                                         className={`h-7 w-10 rounded-md ${locale === "id" ? "bg-brandGreen-600 ring-1 ring-brandGreen-700" : "bg-white"}`}
                                     >
                                         <img
                                             src="/brand/Indonesia.svg"
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
                                             src="/brand/United-Kingdom.svg"
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
                                onClick={() => { setOpen(false); navigate("/login"); }}
                                className="inline-flex justify-center items-center rounded-xl border border-slate-200 bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition"
                            >
                                <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                                {t.login}
                            </button>

                            <button
                                onClick={() => { setOpen(false); navigate("/donate"); }}
                                className="inline-flex justify-center items-center rounded-xl bg-brandGreen-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brandGreen-700 transition"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-2" />
                                {t.donate}
                            </button>
                        </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
