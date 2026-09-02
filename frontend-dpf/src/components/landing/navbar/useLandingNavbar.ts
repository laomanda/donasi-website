import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { globalDict } from "../../../i18n/global";
import { fetchPublicSettings } from "../../../lib/publicSettings";
import { getAuthToken, getAuthUser } from "../../../lib/auth";

export const resolveUserDashboard = (): string | null => {
    const token = getAuthToken();
    if (!token) return null;
    const user = getAuthUser();
    if (!user) return null;

    const candidates: string[] = [];
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        user.roles.forEach((r: any) => {
            if (r && typeof r.name === "string") candidates.push(r.name);
            else if (typeof r === "string") candidates.push(r);
        });
    } else if (typeof user.role_label === "string" && user.role_label.trim() !== "") {
        candidates.push(user.role_label);
    }

    const normalized = new Set(
        candidates.map((v) => v.toLowerCase().replace(/[^a-z]/g, ""))
    );

    if (normalized.has("superadmin")) return "/superadmin/dashboard";
    if (normalized.has("admin")) return "/admin/dashboard";
    if (normalized.has("editor")) return "/editor/dashboard";
    if (normalized.has("keuangan")) return "/keuangan/dashboard";
    if (normalized.has("mitra")) return "/mitra/dashboard";
    return "/management/dashboard";
};

export function useLandingNavbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { locale, setLocale } = useLang();
    const [langOpen, setLangOpen] = useState(false);
    const [publicSettings, setPublicSettings] = useState<Record<string, string>>({});
    
    const langRef = useRef<HTMLDivElement | null>(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const isHeroPage = location.pathname === "/" || location.pathname === "/transparansi";
    const heroMode = isHeroPage && !scrolled;
    const topbarDark = heroMode;
    const showWave = !heroMode && !scrolled;

    const t = useCallback((key: string, fallback?: string) => 
        translate(globalDict, locale, key, fallback), [locale]);

    const phoneNumber = publicSettings["landing.contact_phone"]?.trim() || "+62 851-9554-2022";
    const phoneLink = publicSettings["landing.contact_phone_link"]?.trim() || "https://wa.me/6285195542022";
    const emailText = publicSettings["landing.contact_email"]?.trim() || "wakafdpf@gmail.com";
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

    return {
        open, setOpen,
        scrolled,
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
    };
}

