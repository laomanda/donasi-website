import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCreditCard,
    faHandHoldingHeart,
    faShieldHalved,
    faWallet,
    faPaperPlane,
    faChevronDown,
    faMapMarkerAlt,
    faGlobe,
    faQrcode,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { resolveStorageBaseUrl } from "../lib/urls";
import { useLocation, Link } from "react-router-dom";
import http from "../lib/http";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import { LandingLayout } from "../layouts/LandingLayout";
import PhoneInput from "../components/ui/PhoneInput";

import DpfIcon from "../brand/dpf-icon.png";

// Helper definitions
const formatCurrency = (val: string | number, _locale?: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
};

const formatNumber = (val: string | number) => {
    return new Intl.NumberFormat('id-ID').format(Number(val));
};

const getImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `${resolveStorageBaseUrl()}/${path}`; 
};

const normalizeProgramStatus = (status: string | undefined | null, _locale: string, _t: any) => {
    if (!status) return "";
    return status;
};

const ensureSnapLoaded = (clientKey: string) => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.snap) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; 
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => resolve(true);
        document.body.appendChild(script);
    });
};

const amountOptions = [50000, 100000, 250000, 500000];

const STEPS = [
    { titleKey: "donate.steps.1.title", descKey: "donate.steps.1.desc", icon: faCheckCircle },
    { titleKey: "donate.steps.2.title", descKey: "donate.steps.2.desc", icon: faWallet },
    { titleKey: "donate.steps.3.title", descKey: "donate.steps.3.desc", icon: faPaperPlane },
];

declare global {
    interface Window {
        snap: any;
    }
}


type BankAccount = {
    id: number;
    bank_name: string;
    account_number?: string | null;
    account_name?: string | null;
    image_path?: string | null;
    qris_image_path?: string | null;
    category?: string | null;
    type?: string | null;
    is_visible?: boolean;
    order?: number;
};

type FormState = {
    program_id: string;
    amount: string;
    name: string;
    email: string;
    phone: string;
    notes: string;
    is_anonymous: boolean;
};

type SubmitState = {
    type: "success" | "error" | null;
    messageKey: string | null;
};

function DonatePage() {
    const { locale } = useLang();
    const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [qrisImage, setQrisImage] = useState<string | null>(null);
    const [localizedPrograms, setLocalizedPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>("bank_transfer");
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const donateFormRef = useRef<HTMLFormElement>(null);
    
    const [form, setForm] = useState<FormState>({
        program_id: "",
        amount: "",
        name: "",
        email: "",
        phone: "",
        notes: "",
        is_anonymous: false,
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [submitState, setSubmitState] = useState<SubmitState>({ type: null, messageKey: null });
    const [submitting, setSubmitting] = useState(false);
    const [snapIframeUrl, setSnapIframeUrl] = useState<string | null>(null);
    const currentDonationIdRef = useRef<string | number | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all([
            http.get<{ bank_accounts: BankAccount[] }>("/organization"),
            http.get<{ data: any[] }>("/programs")
        ]).then(([orgRes, progRes]) => {
            if (!active) return;
            setAccounts(orgRes.data?.bank_accounts || []);
            setLocalizedPrograms(progRes.data?.data || []);
        }).catch(err => {
            console.error(err);
            setErrorKey("donate.accounts.error");
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    // Placeholder for getProgress if not imported
    const getProgress = (collected: any, target: any) => {
        if (!target) return 0;
        return Math.min(100, Math.round((Number(collected || 0) / Number(target)) * 100));
    };

    const [wakifLocation, setWakifLocation] = useState<'domestic' | 'international'>('domestic');

    // Handle hash scrolling
    const location = useLocation();
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace("#", "");
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        }
    }, [location.hash, loading]);

    const visibleAccounts = accounts.filter((a) => {
        if (a.is_visible === false) return false;
        // Use 'type' for location. Default to 'domestic' if missing.
        const locationType = a.type === 'international' ? 'international' : 'domestic';
        return locationType === wakifLocation;
    });

    // Group accounts
    const groupedAccounts = useMemo(() => {
        const groups: Record<string, BankAccount[]> = {};
        visibleAccounts.forEach(acc => {
            const cat = acc.category || 'bank_transfer';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(acc);
        });
        return groups;
    }, [visibleAccounts]);

    const categoryLabels: Record<string, string> = {
        bank_transfer: "Transfer Bank",
        domestic: "Transfer Bank",
        international: "Transfer Internasional",
        ewallet: "E-Wallet",
        qris: "QRIS",
        virtual_account: "Virtual Account",
        other: "Lainnya"
    };

    const categoryOrder = ['bank_transfer', 'virtual_account', 'ewallet', 'qris', 'other'];
    const sortedCategories = Object.keys(groupedAccounts).sort((a, b) => {
        return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
    });
    const selectedProgram = localizedPrograms.find((program) => String(program.id) === form.program_id) ?? null;
    const isGeneralDonation = !form.program_id; /* "General Donation" here actually means "Empty State / No Program Selected" based on user request */
    
    // Logic: If program selected & has image -> use it. If not -> use DpfIcon.
    const selectedProgramImage = getImageUrl(selectedProgram?.program_images?.[0] ?? selectedProgram?.banner_path ?? selectedProgram?.thumbnail_path) ?? DpfIcon;
    
    // Logic: If program -> use title. If general (empty) -> use "Select Program" title.
    const selectedProgramTitle = selectedProgram?.title ?? t("donate.program.empty.title");
    const selectedProgramDesc = selectedProgram?.short_description ?? t("donate.program.empty.desc");
    const selectedProgramStatus = normalizeProgramStatus(selectedProgram?.status, locale, t);
    const selectedProgramCategory = selectedProgram?.category ?? null; // Hide category if empty
    const selectedProgramSlug = selectedProgram?.slug ?? "";
    const selectedProgramTarget = selectedProgram?.target_amount ?? null;
    const selectedProgramCollected = selectedProgram?.collected_amount ?? null;
    
    const displayCollected = selectedProgramCollected;
    const displayTarget = selectedProgramTarget;
    const selectedProgramProgress = getProgress(selectedProgramCollected, selectedProgramTarget);
    const hasProgramProgress = selectedProgramTarget !== null || selectedProgramCollected !== null;
    const displayProgress = selectedProgramProgress;
    const detailLink = selectedProgramSlug ? `/program/${selectedProgramSlug}` : "/program";

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value as any }));
        setFormErrors((prev) => ({ ...prev, [key]: "" }));
        setSubmitState({ type: null, messageKey: null });
    };

    const validate = () => {
        const next: { [k: string]: string } = {};
        const alphaSpace = /^[A-Za-z\s]+$/;
        const digits = /^[0-9]+$/;
        // Phone validation handled by library mostly, but we can check basic length
         if (!form.name.trim()) next.name = "donate.form.error.name.required";
        else if (!alphaSpace.test(form.name.trim())) next.name = "donate.form.error.name.alpha";
        if (form.phone && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "donate.form.error.email.invalid";
        if (!form.phone || !form.phone.trim()) next.phone = "donate.form.error.phone.required"; // Required check
        else if (form.phone.length < 8) next.phone = "donate.form.error.phone.numeric"; // Basic length check
        if (!form.amount.trim()) next.amount = "donate.form.error.amount.required";
        else if (!digits.test(form.amount.trim())) next.amount = "donate.form.error.amount.numeric";
        else if (Number(form.amount) < 1000) next.amount = "donate.form.error.amount.min";
        return { ok: Object.keys(next).length === 0, errors: next };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (!v.ok) {
            setFormErrors(v.errors);
            setSubmitState({ type: "error", messageKey: "donate.form.status.checkInput" });
            return;
        }
        setSubmitting(true);
        setSubmitState({ type: null, messageKey: null });
        try {
            const payload: any = {
                program_id: form.program_id || undefined,
                donor_name: form.name,
                donor_email: form.email || undefined,
                donor_phone: form.phone || undefined,
                amount: Number(form.amount),
                is_anonymous: form.is_anonymous,
                notes: form.notes || undefined,
            };
            const res = await http.post("/donations", payload);
            
            // Store donation ID for cancellation fallback
            if (res.data?.donation?.id) {
                currentDonationIdRef.current = res.data.donation.id;
            }

            const snapToken = res.data?.snap_token as string | undefined;
            const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string | undefined;

            if (!snapToken) {
                setSubmitState({ type: "error", messageKey: "donate.form.status.noToken" });
                return;
            }

            let snapLoaded = false;
            if (clientKey) {
                try {
                    await ensureSnapLoaded(clientKey);
                    snapLoaded = !!window.snap?.pay;
                } catch {
                    snapLoaded = false;
                }
            }

            console.log("Snap debug:", { snapLoaded, hasSnapPay: !!window.snap?.pay, hasRedirect: !!res.data?.redirect_url, clientKey });

            if (snapLoaded && window.snap?.pay) {
                console.log("Using Window Snap Pay");
                
                // Start polling immediately in background
                pollPaymentStatus(res.data?.donation?.id);

                window.snap.pay(snapToken, {
                    onSuccess: async (result: any) => {
                        console.log("Snap onSuccess", result);
                        setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                        // Polling already running, but one final check won't hurt
                        await pollPaymentStatus(res.data?.donation?.id);
                    },
                    onPending: async (result: any) => {
                        console.log("Snap onPending", result);
                        // Update UI message but let polling continue
                        setSubmitState({ type: "success", messageKey: "donate.form.status.pending" });
                    },
                    onError: (result: any) => {
                        console.error("Snap onError", result);
                        setSubmitState({ type: "error", messageKey: "donate.form.status.failed" });
                    },
                    onClose: async () => {
                        console.log("Snap closed");
                        // 1. Cek status sekali lagi, siapa tahu sudah sukses tapi callback belum triggered
                        try {
                            const statusRes = await http.post(`/donations/${res.data?.donation?.id}/check-status`);
                            if (statusRes.data?.status === 'paid') {
                                setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                                setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                                return;
                            }
                        } catch (e) {
                             // ignore
                        }

                        // 2. Jika belum paid, anggap gagal/dibatalkan user
                        setSubmitState({ type: "error", messageKey: "donate.form.status.failed" });
                    },
                });
            } else if (res.data?.redirect_url) {
                setSnapIframeUrl(res.data.redirect_url);
                setSubmitState({ type: "success", messageKey: "donate.form.status.snapEmbedded" });
                 // Start polling immediately for redirect/embedded too
                 pollPaymentStatus(res.data?.donation?.id);
            } else {
                setSubmitState({ type: "error", messageKey: "donate.form.status.snapUnavailable" });
            }
        } catch {
            setSubmitState({ type: "error", messageKey: "donate.form.status.error" });
        } finally {
            setSubmitting(false);
        }
    };

    // Helper untuk polling status pembayaran
    const pollPaymentStatus = async (donationId: number | string) => {
        if (!donationId) return;
        
        const maxRetries = 10;
        const delay = 3000; // 3 detik

        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Checking status attempt ${i + 1}/${maxRetries} for donation ${donationId}`);
                const statusRes = await http.post(`/donations/${donationId}/check-status`);
                const status = statusRes.data?.status;
                
                if (status === 'paid') {
                    console.log("Donation marked as PAID!");
                    setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                    setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                    // Optional: Redirect or show confetti
                    break;
                }
                
                if (status === 'failed' || status === 'expired' || status === 'refunded') {
                    console.log(`Donation marked as ${status}`);
                    setSubmitState({ type: "error", messageKey: "donate.form.status.failed" });
                    break;
                }

                // If pending, continue polling
            } catch (e) {
                console.error("Failed to check status", e);
            }
            
            // Tunggu sebelum retry berikutnya
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    return (
        <LandingLayout footerWaveBgClassName="bg-white">
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-brandGreen-50">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-primary-200/30 blur-[110px]" />
                    <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-brandGreen-200/35 blur-[120px]" />
                    <div className="absolute inset-x-10 top-1/3 h-24 rounded-full bg-white/60 blur-3xl" />
                </div>
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-24 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pt-28">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm">
                            {t("donate.hero.badge")}
                        </span>
                        <h1 className="font-body text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                            {t("donate.hero.title.leading")} <span className="text-primary-500">{t("donate.hero.title.highlight")}</span>
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
                            {t("donate.hero.subtitle")}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <a
                                href="/program"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                {t("donate.hero.cta.program")}
                            </a>
                            <a
                                href="/konfirmasi-donasi"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-brandGreen-200 bg-brandGreen-500 text-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-brandGreen-300"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                                {t("donate.hero.cta.confirm")}
                            </a>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
                            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                                <div>
                                    <p className="text-xs font-semibold">{t("donate.hero.trust.badge")}</p>
                                    <p className="text-base font-bold leading-tight">{t("donate.hero.trust.title")}</p>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <InfoPill icon={faCreditCard} label={t("donate.hero.pills.snap")} />
                                <InfoPill icon={faWallet} label={t("donate.hero.pills.manual")} />
                                <InfoPill icon={faCheckCircle} label={t("donate.hero.pills.confirmed")} />
                                <InfoPill icon={faHandHoldingHeart} label={t("donate.hero.pills.support")} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DONASI ONLINE */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
                                <div className="relative">
                                    <img
                                        src={selectedProgramImage}
                                        alt={selectedProgramTitle}
                                        className="h-56 w-full bg-slate-100 object-contain sm:h-60"
                                    />
                                    {!isGeneralDonation && (
                                        <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                                            {selectedProgramStatus}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 p-6">
                                    <h4 className="text-xl font-body font-semibold text-slate-900">{selectedProgramTitle}</h4>
                                    <p className="text-sm leading-relaxed text-slate-600">{selectedProgramDesc}</p>
                                    <div className="space-y-3">
                                        {selectedProgramCategory && (
                                            <span className="inline-flex rounded-full border border-brandGreen-500 bg-brandGreen-500 px-3 py-1 text-[11px] font-semibold text-white">
                                                {selectedProgramCategory}
                                            </span>
                                        )}
                                        <div className="space-y-3">
                                            {/* Hide Progress Bar if General Donation (Empty State) */}
                                            {!isGeneralDonation && (
                                                <div className="h-2 w-full rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-brandGreen-600"
                                                        style={{ width: `${hasProgramProgress ? Math.min(displayProgress, 100) : 0}%` }}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                                {/* Hide Stats if General Donation (Empty State) */}
                                                {!isGeneralDonation && (
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span>
                                                            {t("donate.card.collected")}{" "}
                                                            <span className="font-semibold text-slate-700">
                                                                {hasProgramProgress ? formatCurrency(displayCollected, locale) : formatCurrency(0, locale)}
                                                            </span>
                                                        </span>
                                                        <span>
                                                            {t("donate.card.target")}{" "}
                                                            <span className="font-semibold text-slate-700">
                                                                {hasProgramProgress && displayTarget !== null
                                                                    ? formatCurrency(displayTarget, locale)
                                                                    : t("donate.card.flexible")}
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}

                                                    {/* Change Button Action based on State */}
                                                    {isGeneralDonation ? (
                                                        <a
                                                            href="/program"
                                                            className="inline-flex items-center justify-center rounded-full border border-transparent bg-brandGreen-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-700"
                                                        >
                                                            {t("donate.program.empty.cta")}
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={detailLink}
                                                            className="inline-flex items-center justify-center rounded-full border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brandGreen-700 hover:to-primary-700"
                                                        >
                                                            {t("donate.card.detail")}
                                                        </Link>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        <form ref={donateFormRef} onSubmit={handleSubmit} className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-4">
                            <SelectField
                                label={t("donate.form.selectLabel")}
                                value={form.program_id}
                                onChange={(v) => handleChange("program_id", v)}
                                options={[
                                    { value: "", label: t("donate.form.selectPlaceholder", "Pilih Program") },
                                    ...localizedPrograms.map((p) => {
                                        const isClosed = ["completed", "selesai", "tersalurkan", "archived", "arsip"].includes(
                                            String(p.status ?? "").trim().toLowerCase()
                                        );
                                        return {
                                            value: String(p.id),
                                            label: isClosed ? `${p.title} (Tersalurkan)` : p.title,
                                            disabled: isClosed,
                                        };
                                    }),
                                ]}
                            />
                            <InputField
                                label={t("donate.form.name")}
                                value={form.name}
                                onChange={(v) => handleChange("name", v)}
                                required
                                error={formErrors.name ? t(formErrors.name) : ""}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InputField
                                    label={t("donate.form.email")}
                                    value={form.email}
                                    onChange={(v) => handleChange("email", v)}
                                    error={formErrors.email ? t(formErrors.email) : ""}
                                />
                                <PhoneInput
                                    label={t("donate.form.phone")}
                                    value={form.phone}
                                    onChange={(v) => handleChange("phone", v || "")}
                                    error={formErrors.phone ? t(formErrors.phone) : ""}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-700">{t("donate.form.quickPick")}</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {amountOptions.map((amount) => {
                                        const value = String(amount);
                                        const isActive = form.amount.trim() === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleChange("amount", value)}
                                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${isActive
                                                    ? "border-brandGreen-600 bg-brandGreen-600 text-white shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-brandGreen-200 hover:text-brandGreen-700"
                                                    }`}
                                            >
                                                {formatNumber(amount)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <InputField
                                label={t("donate.form.amount")}
                                value={form.amount}
                                onChange={(v) => handleChange("amount", v)}
                                required
                                error={formErrors.amount ? t(formErrors.amount) : ""}
                            />
                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.is_anonymous}
                                    onChange={(e) => handleChange("is_anonymous", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-200"
                                />
                                {t("donate.form.anonymous")}
                            </label>
                            <InputField label={t("donate.form.notes")} value={form.notes} onChange={(v) => handleChange("notes", v)} />

                            {submitState.messageKey && submitState.messageKey !== "donate.form.status.snapEmbedded" && (
                                <div
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${submitState.type === "success"
                                        ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                        : "border border-red-100 bg-red-50 text-red-700"
                                        }`}
                                >
                                    {t(submitState.messageKey)}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FontAwesomeIcon icon={faCreditCard} />
                                {submitting ? t("donate.form.status.processing") : t("donate.form.submit")}
                            </button>

                            <p className="text-xs text-slate-500">
                                {t("donate.form.helper.manual")}{" "}
                                <Link to="/konfirmasi-donasi" className="font-semibold text-brandGreen-700 hover:text-brandGreen-800">
                                    {t("donate.form.helper.manual.link")}
                                </Link>.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* LANGKAH SINGKAT */}
            <section className="bg-slate-50 py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center space-y-3 mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brandGreen-700 border border-brandGreen-200 shadow-sm">
                            {t("donate.steps.badge")}
                        </div>
                        <h2 className="text-3xl font-body font-bold text-slate-900 sm:text-4xl">
                            {t("donate.steps.title")}
                        </h2>
                    </div>

                    {/* Steps Grid */}
                    <div className="relative">
                        {/* Connection Line - Desktop */}
                        <div className="absolute top-10 left-0 right-0 h-px bg-brandGreen-200 hidden lg:block"
                            style={{ width: 'calc(100% - 100px)', marginLeft: '50px' }}>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {STEPS.map((step, idx) => (
                                <div key={step.titleKey} className="relative">
                                    {/* Card */}
                                    <div className="relative h-full flex flex-col bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md">

                                        {/* Icon Circle */}
                                        <div className="relative mb-4">
                                            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-xl bg-brandGreen-600 text-white shadow-sm">
                                                <FontAwesomeIcon icon={step.icon} className="text-xl" />
                                            </div>

                                            {/* Number Badge */}
                                            <div className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold border-2 border-white">
                                                {idx + 1}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2 flex-1">
                                            <p className="text-[10px] font-semibold text-brandGreen-600">
                                                {t("donate.steps.stepLabel")} {idx + 1}
                                            </p>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {t(step.titleKey)}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-slate-600">
                                                {t(step.descKey)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* REKENING */}
            <section id="rekening-resmi" className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

                    {/* Wakif Location Switcher */}
                    <div className="mb-8 flex justify-center">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1">
                            <button
                                onClick={() => setWakifLocation('domestic')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${wakifLocation === 'domestic'
                                    ? 'bg-white text-brandGreen-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                Wakif Dalam Negeri
                            </button>
                            <button
                                onClick={() => setWakifLocation('international')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${wakifLocation === 'international'
                                    ? 'bg-white text-brandGreen-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faGlobe} />
                                Wakif Luar Negeri
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-700">
                            <FontAwesomeIcon icon={faWallet} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-brandGreen-700">{t("donate.accounts.badge")}</p>
                            <h2 className="text-2xl font-body font-semibold text-slate-900">{t("donate.accounts.heading")}</h2>
                        </div>
                    </div>

                    {errorKey && (
                        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {t(errorKey)}
                        </div>
                    )}

                    <div className="space-y-12">
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, idx) => <AccountSkeleton key={`acc-skel-${idx}`} />)}
                            </div>
                        ) : visibleAccounts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                {t("donate.accounts.empty")}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-sm">
                                {sortedCategories.map(cat => (
                                    <div key={cat} className="bg-white overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                            className={`flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 ${activeCategory === cat ? 'bg-slate-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-8 w-1.5 rounded-full transition-colors ${activeCategory === cat ? 'bg-brandGreen-500' : 'bg-slate-300'}`} />
                                                <h3 className={`text-lg font-bold transition-colors ${activeCategory === cat ? 'text-brandGreen-800' : 'text-slate-700'}`}>
                                                    {categoryLabels[cat] || cat}
                                                </h3>
                                            </div>
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${activeCategory === cat ? 'bg-brandGreen-100 text-brandGreen-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </div>
                                        </button>

                                        <div
                                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${activeCategory === cat ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="border-t border-slate-100 bg-white px-6 py-6">
                                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                        {groupedAccounts[cat].map(acc => (
                                                            <AccountCard
                                                                key={acc.id}
                                                                account={acc}
                                                                t={t}
                                                                onShowQris={(url) => setQrisImage(url)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center">
                        <p className="text-sm font-semibold text-slate-600">
                            {t("donate.accounts.note")}{" "}
                            <a className="text-brandGreen-700 underline decoration-2 underline-offset-2 hover:text-brandGreen-800" href="/konfirmasi-donasi">
                                {t("donate.accounts.note.link")}
                            </a>{" "}
                            {t("donate.accounts.note.suffix")}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white pb-20">
                <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-100 bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-10 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)] sm:px-10">
                    <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
                        <div className="space-y-3 text-center lg:text-left">
                            <p className="text-sm font-bold text-emerald-50">{t("donate.cta.badge")}</p>
                            <h3 className="text-3xl font-body font-semibold leading-tight">{t("donate.cta.heading")}</h3>
                            <p className="text-sm text-emerald-50">{t("donate.cta.subtitle")}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <a
                                href="/program"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                {t("donate.cta.program")}
                            </a>
                            <a
                                href="/konfirmasi-donasi"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                                {t("donate.cta.confirmManual")}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {snapIframeUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 px-4">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800">{t("donate.snap.modalTitle")}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSnapIframeUrl(null);
                                    if (currentDonationIdRef.current) {
                                        console.log("Cancelling fallback donation ID:", currentDonationIdRef.current);
                                        http.post(`/donations/${currentDonationIdRef.current}/cancel`)
                                            .catch((err) => console.error("Cancellation failed:", err));
                                    }
                                }}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            >
                                {t("donate.snap.cancel")}
                            </button>
                        </div>
                        <div className="w-full bg-slate-100" style={{ height: "520px" }}>
                            <iframe
                                src={snapIframeUrl}
                                title={t("donate.payment.iframeTitle")}
                                className="h-full w-full border-0"
                                allow="payment *; geolocation *"
                            />
                        </div>

                    </div>
                </div>
            )}

            {/* QRIS Modal */}
            {qrisImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 backdrop-blur-sm" onClick={() => setQrisImage(null)}>
                    <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Scan QRIS</h3>
                            <button
                                type="button"
                                onClick={() => setQrisImage(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="aspect-square w-full rounded-2xl bg-white p-2 border border-slate-100">
                            <img src={qrisImage} alt="QRIS Code" className="h-full w-full object-contain" />
                        </div>
                        <p className="mt-4 text-center text-sm font-medium text-slate-500">
                            Scan kode QR di atas menggunakan aplikasi e-wallet atau mobile banking Anda.
                        </p>
                    </div>
                </div>
            )}
        </LandingLayout>
    );
}

function InfoPill({ icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-50 text-brandGreen-700">
                <FontAwesomeIcon icon={icon} />
            </span>
            <span>{label}</span>
        </div>
    );
}

function AccountCard({
    account,
    t,
    onShowQris,
}: {
    account: BankAccount;
    t: (key: string, fallback?: string) => string;
    onShowQris: (url: string) => void;
}) {


    const initials = account.bank_name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    const imageUrl = getImageUrl(account.image_path);

    return (
        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] transition hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-1">
                        {account.image_path ? (
                            <img src={imageUrl} alt={account.bank_name} className="h-full w-full object-contain rounded-xl" />
                        ) : (
                            <span className="text-xs font-bold tracking-[0.16em] text-primary-700">{initials || "DPF"}</span>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("donate.accounts.bankLabel")}</p>
                        <p className="text-base font-body font-bold text-slate-900 leading-tight">{account.bank_name}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("donate.accounts.number")}</p>
                <div className="mt-1 flex items-center justify-between">
                    <p className="text-xl font-body font-bold text-slate-900 tracking-[0.05em]">
                        {account.account_number}
                    </p>
                    <button
                        onClick={() => {
                            if (account.account_number) navigator.clipboard.writeText(account.account_number);
                        }}
                        className="text-xs font-semibold text-brandGreen-600 hover:text-brandGreen-700"
                        title="Salin"
                    >
                        Salin
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-500">{t("donate.accounts.holder")}</span>
                    <span className="font-bold text-slate-900 text-right">{account.account_name}</span>
                </div>
                {account.qris_image_path && (
                    <button
                        type="button"
                        onClick={() => onShowQris(getImageUrl(account.qris_image_path!) as string)}
                        className="mt-3 w-full rounded-xl border border-brandGreen-200 bg-brandGreen-50 py-2.5 text-center text-sm font-bold text-brandGreen-700 hover:bg-brandGreen-100 transition"
                    >
                        <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                        Lihat / Scan QRIS
                    </button>
                )}
            </div>
        </div>
    );
}

function AccountSkeleton() {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] animate-pulse space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-slate-100" />
                    <div className="h-4 w-32 rounded bg-slate-100" />
                </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-5 w-40 rounded bg-slate-100" />
            </div>
            <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; disabled?: boolean }[];
}) {
    return (
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span className="leading-tight">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function InputField({
    label,
    value,
    onChange,
    required,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    error?: string;
}) {
    const base =
        "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
    const state = error
        ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
        : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
    return (
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span className="leading-tight">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`${base} ${state}`}
            />
            {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
        </label>
    );
}

export default DonatePage;
export { DonatePage };

