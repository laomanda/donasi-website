import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCreditCard,
    faHandHoldingHeart,
    faShieldHalved,
    faWallet,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { WaveDivider } from "../components/landing/WaveDivider";
import http from "../lib/http";
import { Link, useSearchParams } from "react-router-dom";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import donasiUmumImage from "../brand/assets/Donasi-umum.png";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type BankAccount = {
    id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    branch?: string | null;
    is_visible?: boolean;
    notes?: string | null;
};

type OrganizationResponse = {
    bank_accounts?: BankAccount[];
};

type DonationSummaryResponse = {
    general?: {
        amount?: number | string | null;
        count?: number | null;
    };
};

type Program = {
    id: number;
    title: string;
    title_en?: string | null;
    status: string;
    short_description?: string | null;
    short_description_en?: string | null;
    thumbnail_path?: string | null;
    banner_path?: string | null;
    program_images?: string[] | null;
    category?: string | null;
    category_en?: string | null;
    slug?: string;
    target_amount?: number | string | null;
    collected_amount?: number | string | null;
    deadline_days?: number | string | null;
};

declare global {
    interface Window {
        snap?: {
            pay: (token: string, callbacks?: Record<string, any>) => void;
        };
    }
}

const STEPS = [
    { titleKey: "donate.steps.1.title", descKey: "donate.steps.1.desc", icon: faHandHoldingHeart },
    { titleKey: "donate.steps.2.title", descKey: "donate.steps.2.desc", icon: faCreditCard },
    { titleKey: "donate.steps.3.title", descKey: "donate.steps.3.desc", icon: faWallet },
    { titleKey: "donate.steps.4.title", descKey: "donate.steps.4.desc", icon: faShieldHalved },
    { titleKey: "donate.steps.5.title", descKey: "donate.steps.5.desc", icon: faPaperPlane },
];

const getImageUrl = (path?: string | null) => {
    if (!path) return imagePlaceholder;
    if (path.startsWith("http")) return path;
    const base = resolveStorageBaseUrl();
    return `${base}/${path}`;
};

const normalizeProgramStatus = (
    status?: string | null,
    locale: "id" | "en" = "id",
    t?: (key: string, fallback?: string) => string
) => {
    const translateFn = t ?? ((key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback));
    const raw = String(status ?? "").trim();
    if (!raw) return translateFn("donate.program.status.unset");
    const s = raw.toLowerCase();
    if (s === "active" || s === "berjalan") return translateFn("landing.programs.status.ongoing");
    if (s === "completed" || s === "selesai" || s === "archived" || s === "arsip") {
        return translateFn("landing.programs.status.completed");
    }
    if (s === "draft" || s === "segera") return translateFn("landing.programs.status.upcoming");
    return raw;
};

const formatCurrency = (value: number | string | null | undefined, locale: "id" | "en") =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(Number(value ?? 0));

const getProgress = (collected?: number | string | null, target?: number | string | null) => {
    const safeTarget = Math.max(Number(target ?? 0), 1);
    const value = Math.round((Number(collected ?? 0) / safeTarget) * 100);
    return Number.isNaN(value) ? 0 : value;
};

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
    const idText = (idVal ?? "").trim();
    const enText = (enVal ?? "").trim();
    if (locale === "en") return enText || idText;
    return idText || enText;
};

function DonatePage() {
    const { locale } = useLang();
    const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
    const [searchParams] = useSearchParams();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [generalDonationSummary, setGeneralDonationSummary] = useState<{ amount: number; count: number }>({
        amount: 0,
        count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [form, setForm] = useState({
        program_id: "",
        name: "",
        email: "",
        phone: "",
        amount: "",
        is_anonymous: false,
        notes: "",
    });
    const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
    const [submitState, setSubmitState] = useState<{ type: "success" | "error" | null; messageKey: string | null }>({
        type: null,
        messageKey: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const snapLoader = useRef<Promise<void> | null>(null);
    const [snapIframeUrl, setSnapIframeUrl] = useState<string | null>(null);
    const donateFormRef = useRef<HTMLFormElement | null>(null);
    const lastPrefilledProgramRef = useRef<string | null>(null);
    const amountOptions = [10000, 20000, 50000, 100000];
    const formatNumber = (value: number | string | null | undefined) =>
        new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(Number(value ?? 0));

    const requestedProgramId = (searchParams.get("program_id") ?? "").trim() || null;
    const localizedPrograms = useMemo(
        () =>
            programs.map((p) => ({
                ...p,
                title: pickLocale(p.title, p.title_en, locale),
                category: pickLocale(p.category, p.category_en, locale),
                short_description: pickLocale(p.short_description, p.short_description_en, locale),
            })),
        [programs, locale]
    );

    useEffect(() => {
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string | undefined;
        if (!clientKey) return;
        ensureSnapLoaded(clientKey);
    }, []);

    const ensureSnapLoaded = (clientKey: string) => {
        if (window.snap?.pay) return Promise.resolve();
        if (snapLoader.current) return snapLoader.current;
        snapLoader.current = new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            const isProd = import.meta.env.VITE_MIDTRANS_ENV === "production";
            script.src = isProd
                ? "https://app.midtrans.com/snap/snap.js"
                : "https://app.sandbox.midtrans.com/snap/snap.js";
            script.type = "text/javascript";
            script.dataset.clientKey = clientKey;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(t("donate.snap.loadError")));
            document.body.appendChild(script);
        });
        return snapLoader.current;
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all([
            http.get<OrganizationResponse>("/organization"),
            http.get<{ data: Program[] }>("/programs").catch(() => ({ data: [] as any })),
            http.get<DonationSummaryResponse>("/donations/summary").catch(() => ({ data: { general: { amount: 0, count: 0 } } })),
        ])
            .then(([orgRes, progRes, summaryRes]) => {
                if (!active) return;
                setAccounts(orgRes.data?.bank_accounts ?? []);
                setPrograms(progRes.data?.data ?? []);
                setGeneralDonationSummary({
                    amount: Number(summaryRes.data?.general?.amount ?? 0),
                    count: Number(summaryRes.data?.general?.count ?? 0),
                });
                setErrorKey(null);
            })
            .catch(() => {
                if (!active) return;
                setErrorKey("donate.error.load");
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!requestedProgramId) {
            lastPrefilledProgramRef.current = null;
            return;
        }
        if (lastPrefilledProgramRef.current === requestedProgramId) return;
        if (programs.length === 0) return;

        const exists = programs.some((p) => String(p.id) === requestedProgramId);
        lastPrefilledProgramRef.current = requestedProgramId;
        if (!exists) return;

        setForm((prev) => ({ ...prev, program_id: requestedProgramId }));
        requestAnimationFrame(() => donateFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }, [requestedProgramId, programs]);

    const visibleAccounts = accounts.filter((a) => a.is_visible !== false);
    const selectedProgram = localizedPrograms.find((program) => String(program.id) === form.program_id) ?? null;
    const isGeneralDonation = !form.program_id;
    const selectedProgramImage = isGeneralDonation
        ? donasiUmumImage
        : getImageUrl(selectedProgram?.program_images?.[0] ?? selectedProgram?.banner_path ?? selectedProgram?.thumbnail_path ?? null);
    const selectedProgramTitle = isGeneralDonation
        ? t("donate.program.general")
        : selectedProgram?.title ?? t("donate.program.notFound");
    const selectedProgramDesc = isGeneralDonation
        ? t("donate.program.generalDesc")
        : selectedProgram?.short_description ?? t("donate.program.fallbackDesc");
    const selectedProgramStatus = isGeneralDonation
        ? t("donate.program.status.general")
        : normalizeProgramStatus(selectedProgram?.status, locale, t);
    const selectedProgramCategory = isGeneralDonation ? null : selectedProgram?.category ?? t("landing.programs.defaultCategory");
    const selectedProgramSlug = selectedProgram?.slug ?? "";
    const selectedProgramTarget = selectedProgram?.target_amount ?? null;
    const selectedProgramCollected = selectedProgram?.collected_amount ?? null;
    const generalDonationAmount = generalDonationSummary.amount ?? 0;
    const generalDonationCount = generalDonationSummary.count ?? 0;
    const displayCollected = isGeneralDonation ? generalDonationAmount : selectedProgramCollected;
    const displayTarget = isGeneralDonation ? null : selectedProgramTarget;
    const selectedProgramProgress = getProgress(selectedProgramCollected, selectedProgramTarget);
    const hasProgramProgress = isGeneralDonation
        ? generalDonationAmount > 0
        : selectedProgramTarget !== null || selectedProgramCollected !== null;
    const displayProgress = isGeneralDonation
        ? generalDonationAmount > 0
            ? 100
            : 0
        : selectedProgramProgress;
    const detailLink = !isGeneralDonation && selectedProgramSlug ? `/program/${selectedProgramSlug}` : "/program";

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value as any }));
        setFormErrors((prev) => ({ ...prev, [key]: "" }));
        setSubmitState({ type: null, messageKey: null });
    };

    const validate = () => {
        const next: { [k: string]: string } = {};
        const alphaSpace = /^[A-Za-z\s]+$/;
        const digits = /^[0-9]+$/;
        if (!form.name.trim()) next.name = "donate.form.error.name.required";
        else if (!alphaSpace.test(form.name.trim())) next.name = "donate.form.error.name.alpha";
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "donate.form.error.email.invalid";
        if (form.phone && !digits.test(form.phone.trim())) next.phone = "donate.form.error.phone.numeric";
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

            if (snapLoaded && window.snap?.pay) {
                window.snap.pay(snapToken, {
                    onSuccess: () => setSubmitState({ type: "success", messageKey: "donate.form.status.success" }),
                    onPending: () => setSubmitState({ type: "success", messageKey: "donate.form.status.pending" }),
                    onError: () => setSubmitState({ type: "error", messageKey: "donate.form.status.failed" }),
                    onClose: () => setSubmitState({ type: "error", messageKey: "donate.form.status.closed" }),
                });
            } else if (res.data?.redirect_url) {
                setSnapIframeUrl(res.data.redirect_url);
                setSubmitState({ type: "success", messageKey: "donate.form.status.snapEmbedded" });
            } else {
                setSubmitState({ type: "error", messageKey: "donate.form.status.snapUnavailable" });
            }
        } catch {
            setSubmitState({ type: "error", messageKey: "donate.form.status.error" });
        } finally {
            setSubmitting(false);
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
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-18 pt-24 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pt-28">
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

            <WaveDivider fillClassName="fill-white" className="-mt-1" />

            {/* DONASI ONLINE (Midtrans) */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
                                <div className="relative">
                                    <img
                                        src={selectedProgramImage}
                                        alt={selectedProgramTitle}
                                        className="h-56 w-full bg-slate-100 object-contain sm:h-60"
                                    />
                                    <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                                        {selectedProgramStatus}
                                    </div>
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
                                            <div className="h-2 w-full rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-brandGreen-600"
                                                    style={{ width: `${hasProgramProgress ? Math.min(displayProgress, 100) : 0}%` }}
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
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
                                                {isGeneralDonation && generalDonationCount > 0 && (
                                                    <span>
                                                        {t("donate.card.totalDonations")}{" "}
                                                        <span className="font-semibold text-slate-700">{formatNumber(generalDonationCount)}</span>
                                                    </span>
                                                )}
                                            </div>
                                            {!isGeneralDonation && (
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

                            <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)]">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-emerald-50">{t("donate.midtrans.badge")}</p>
                                        <h3 className="mt-3 text-3xl font-body font-semibold leading-tight">{t("donate.midtrans.title")}</h3>
                                        <p className="mt-2 text-sm text-emerald-50">{t("donate.midtrans.desc")}</p>
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs font-semibold text-emerald-100">{t("donate.midtrans.methods.title")}</p>
                                        <ul className="mt-3 space-y-2 text-sm text-emerald-50">
                                            <li className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCreditCard} />
                                                {t("donate.midtrans.methods.1")}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faWallet} />
                                                {t("donate.midtrans.methods.2")}
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs font-semibold text-emerald-100">{t("donate.midtrans.benefits.title")}</p>
                                        <ul className="mt-3 space-y-2 text-sm text-emerald-50">
                                            <li className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                {t("donate.midtrans.benefits.1")}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                                {t("donate.midtrans.benefits.2")}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3 text-xs text-emerald-50/90">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                                        <FontAwesomeIcon icon={faShieldHalved} />
                                        {t("donate.midtrans.badges.receipt")}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        {t("donate.midtrans.badges.notify")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form ref={donateFormRef} onSubmit={handleSubmit} className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-4">
                            <SelectField
                                label={t("donate.form.selectLabel")}
                                value={form.program_id}
                                onChange={(v) => handleChange("program_id", v)}
                                options={[
                                    { value: "", label: t("donate.form.generalOption") },
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
                                <InputField
                                    label={t("donate.form.phone")}
                                    value={form.phone}
                                    onChange={(v) => handleChange("phone", v)}
                                    error={formErrors.phone ? t(formErrors.phone) : ""}
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
                                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                                    isActive
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

                            {submitState.messageKey && (
                                <div
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                                        submitState.type === "success"
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

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
            <section className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-700">
                            <FontAwesomeIcon icon={faWallet} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-brandGreen-700">{t("donasi.accounts.badge")}</p>
                            <h2 className="text-2xl font-body font-semibold text-slate-900">{t("donasi.accounts.heading")}</h2>
                        </div>
                    </div>

                    {errorKey && (
                        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {t(errorKey)}
                        </div>
                    )}

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loading
                            ? Array.from({ length: 3 }).map((_, idx) => <AccountSkeleton key={`acc-skel-${idx}`} />)
                            : visibleAccounts.length > 0
                                ? visibleAccounts.map((acc) => <AccountCard key={acc.id} account={acc} t={t} />)
                                : (
                                    <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                        {t("donasi.accounts.empty")}
                                    </div>
                                )}
                    </div>

                    <div className="mt-6 text-sm text-slate-600">
                        {t("donate.accounts.note")}{" "}
                        <a className="font-semibold text-brandGreen-700 hover:text-brandGreen-800" href="/konfirmasi-donasi">
                            {t("donate.accounts.note.link")}
                        </a>{" "}
                        {t("donate.accounts.note.suffix")}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white pb-20">
                <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-100 bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-10 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)] sm:px-10">
                    <div className="grid gap-6 sm:grid-cols-[1.2fr,0.8fr] sm:items-center">
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-emerald-50">{t("donate.cta.badge")}</p>
                            <h3 className="text-3xl font-body font-semibold leading-tight">{t("donate.cta.heading")}</h3>
                            <p className="text-sm text-emerald-50">{t("donate.cta.subtitle")}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:items-end">
                            <a
                                href="/program"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                {t("donate.cta.program")}
                            </a>
                            <a
                                href="/konfirmasi-donasi"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
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
                                onClick={() => setSnapIframeUrl(null)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            >
                                {t("donate.snap.cancel")}
                            </button>
                        </div>
                        <div className="w-full bg-slate-100" style={{ height: "520px" }}>
                            <iframe
                                src={snapIframeUrl}
                                title={t("donate.midtrans.title")}
                                className="h-full w-full border-0"
                                allow="payment *; geolocation *"
                            />
                        </div>

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

function AccountCard({ account, t }: { account: BankAccount; t: (key: string, fallback?: string) => string }) {
    const initials = account.bank_name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    return (
        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                        <span className="text-xs font-bold tracking-[0.16em]">{initials || "DPF"}</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400">{t("donate.accounts.bankLabel")}</p>
                        <p className="text-base font-body font-semibold text-slate-900">{account.bank_name}</p>
                    </div>
                </div>
                <span className="rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
                    {t("donate.accounts.official")}
                </span>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-400">{t("donate.accounts.number")}</p>
                <p className="mt-2 text-xl font-body font-semibold text-slate-900 tracking-[0.08em]">
                    {account.account_number}
                </p>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-400">{t("donate.accounts.holder")}</span>
                    <span className="font-semibold text-slate-900">{account.account_name}</span>
                </div>
                {account.branch && (
                    <div className="flex items-center justify-between gap-3 text-slate-600">
                        <span className="text-[11px] font-semibold text-slate-400">{t("donate.accounts.branch")}</span>
                        <span className="font-semibold text-slate-700">{account.branch}</span>
                    </div>
                )}
                {account.notes && (
                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600">
                        {account.notes}
                    </div>
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
        <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{label}</span>
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
        <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{label}</span>
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

