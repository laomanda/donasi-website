import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { globalDict } from "../../../i18n/global";
import { fetchPublicSettings } from "../../../lib/publicSettings";
import { getAuthToken, getAuthUser } from "../../../lib/auth";
import { SEARCH_ITEMS, SEARCH_INDEX } from "./LandingNavbarShared";

export const resolveUserDashboard = (): string | null => {
    const token = getAuthToken();
    if (!token) return null;
    const user = getAuthUser();
    if (!user) return null;

    const candidates: string[] = [];
    if (Array.isArray(user.roles)) {
        user.roles.forEach((r: any) => {
            if (r && typeof r.name === "string") candidates.push(r.name);
        });
    }
    if (typeof user.role_label === "string") candidates.push(user.role_label);

    const normalized = new Set(
        candidates.map((v) => v.toLowerCase().replace(/[^a-z]/g, ""))
    );

    if (normalized.has("superadmin")) return "/superadmin/dashboard";
    if (normalized.has("admin")) return "/admin/dashboard";
    if (normalized.has("editor")) return "/editor/dashboard";
    if (normalized.has("mitra")) return "/mitra/dashboard";
    return "/editor/dashboard";
};

export function useLandingNavbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { locale, setLocale } = useLang();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
    const [langOpen, setLangOpen] = useState(false);
    const [publicSettings, setPublicSettings] = useState<Record<string, string>>({});
    
    const langRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const isLanding = location.pathname === "/";
    const heroMode = isLanding && !scrolled;
    const topbarDark = heroMode;
    const showWave = !heroMode && !scrolled;

    const t = useCallback((key: string, fallback?: string) => 
        translate(globalDict, locale, key, fallback), [locale]);

    const phoneNumber = publicSettings["landing.contact_phone"]?.trim() || "0813-1176-8254";
    const phoneLink = publicSettings["landing.contact_phone_link"]?.trim() || "https://wa.me/6281311768254";
    const emailText = publicSettings["landing.contact_email"]?.trim() || "info@dpf.or.id";
    const emailLink = publicSettings["landing.contact_email_link"]?.trim() || `https://mail.google.com/mail/?view=cm&fs=1&to=${emailText}`;

    // Scroll handler
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Public settings
    useEffect(() => {
        let active = true;
        fetchPublicSettings([
            "landing.contact_phone",
            "landing.contact_phone_link",
            "landing.contact_email",
            "landing.contact_email_link",
        ])
        .then((settings: any) => {
            if (active) setPublicSettings(settings);
        })
        .catch(() => { });
        return () => { active = false; };
    }, []);

    // Mobile Menu Body Scroll Lock & ESC
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

    // Search Input Focus
    useEffect(() => {
        if (!searchOpen) return;
        const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
        return () => window.clearTimeout(id);
    }, [searchOpen]);

    // Language Outside Click
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
            const label = item.labels[locale as "id" | "en"].toLowerCase();
            const matchLabel = label.includes(term);
            const matchKeyword = item.keywords.some((keyword) => keyword.toLowerCase().includes(term));
            return matchLabel || matchKeyword;
        });

        const matchCorpus = SEARCH_INDEX.find((entry) => entry.corpus.toLowerCase().includes(term));
        const targetHref = matchItem?.href || matchCorpus?.href;

        if (!targetHref) {
            setSearchFeedback(t("nav.search.notFound"));
            setSearchQuery(t("nav.search.notFound"));
            return;
        }

        navigate(targetHref);
        setOpen(false);
        setSearchOpen(false);
        setSearchFeedback(null);
    };

    return {
        open, setOpen,
        scrolled,
        locale, setLocale,
        searchQuery, setSearchQuery,
        searchOpen, setSearchOpen,
        searchFeedback, setSearchFeedback,
        langOpen, setLangOpen,
        langRef,
        searchInputRef,
        navigate,
        location,
        heroMode,
        topbarDark,
        showWave,
        t,
        phoneNumber, phoneLink,
        emailText, emailLink,
        handleSearchChange,
        handleSearch,
        resolveUserDashboard
    };
}
