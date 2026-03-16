import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faHandHoldingHeart, 
    faPaperPlane, 
    faCreditCard, 
    faWallet, 
    faCheckCircle, 
    faShieldHalved,
    faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import http from "../lib/http";
import { useLang } from "../lib/i18n";
import { donateDict } from "../components/donate/DonateI18n";
import { translate } from "../lib/i18n-utils";
import { LandingLayout } from "../layouts/LandingLayout";
import { getAuthUser } from "../lib/auth";
import { PageHero } from "../components/PageHero";

// Refactored Components
import { DonationForm } from "@/components/donate/DonationForm";
import { ProgramShowcase } from "@/components/donate/ProgramShowcase";
import { BankAccountsSection } from "@/components/donate/BankAccountsSection";
import { PaymentStatusOverlays } from "@/components/donate/PaymentStatusOverlays";
import { type BankAccount, InfoPill } from "@/components/donate/DonateUI";

// Helpers
import { getImageUrl, normalizeProgramStatus } from "@/lib/utils";

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

declare global {
    interface Window {
        snap: any;
    }
}

interface FormState {
    program_id: string;
    amount: string;
    name: string;
    email: string;
    phone: string;
    notes: string;
    is_anonymous: boolean;
}

interface SubmitState {
    type: "success" | "error" | null;
    messageKey: string | null;
}

function QuoteSlideshow() {
    const { locale } = useLang();
    const [index, setIndex] = useState(0);

    const localizedQuotes = useMemo(() => [
        {
            text: translate(donateDict, locale, "donate.quotes.1.text"),
            source: translate(donateDict, locale, "donate.quotes.1.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.2.text"),
            source: translate(donateDict, locale, "donate.quotes.2.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.3.text"),
            source: translate(donateDict, locale, "donate.quotes.3.source")
        },
        {
            text: translate(donateDict, locale, "donate.quotes.4.text"),
            source: translate(donateDict, locale, "donate.quotes.4.source")
        }
    ], [locale]);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % localizedQuotes.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [localizedQuotes.length]);

    return (
        <section className="relative overflow-hidden bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-4xl px-6 text-center">
                <div className="relative h-48 sm:h-40 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${index}-${locale}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            className="w-full"
                        >
                            <p className="font-heading text-lg font-medium italic leading-relaxed text-slate-800 sm:text-2xl">
                                "{localizedQuotes[index].text}"
                            </p>
                            {localizedQuotes[index].source && (
                                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">
                                    {localizedQuotes[index].source}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
    const idText = (idVal ?? "").trim();
    const enText = (enVal ?? "").trim();
    if (locale === "en") return enText || idText;
    return idText || enText;
};

const DonatePage = () => {
    const { locale } = useLang();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const t = (key: string, fallback?: string) => translate(donateDict, locale, key, fallback);

    // Handle hash scrolling (e.g. from ProposalSection)
    useEffect(() => {
        if (location.hash === "#donate-form-section") {
            const el = document.getElementById("donate-form-section");
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 600);
            }
        }
    }, [location.hash]);
    
    // Core Data State
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>({
        program_id: "",
        amount: "",
        name: "",
        email: "",
        phone: "",
        notes: "",
        is_anonymous: false,
    });
    
    // UI & Submission State
    const [activeCategory, setActiveCategory] = useState<string | null>("bank_transfer");
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [submitState, setSubmitState] = useState<SubmitState>({ type: null, messageKey: null });
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [showFailedOverlay, setShowFailedOverlay] = useState(false);
    const [showDanaConfirm, setShowDanaConfirm] = useState(false);
    const [showPendingBanner, setShowPendingBanner] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [qrisImage, setQrisImage] = useState<string | null>(null);

    // Refs for persistence
    const currentDonationIdRef = useRef<string | number | null>(null);
    const snapSuccessFiredRef = useRef(false);
    const pendingDonationIdRef = useRef<number | null>(null);

    // Initial Load
    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all([
            http.get<{ bank_accounts: BankAccount[] }>("/organization"),
            http.get<{ data: any[] }>("/programs?per_page=100")
        ]).then(([orgRes, progRes]) => {
            if (!active) return;
            setAccounts(orgRes.data?.bank_accounts || []);
            setPrograms(progRes.data?.data || []);
        }).catch(err => {
            console.error(err);
            setErrorKey("donate.accounts.error");
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    // Load User Profile
    useEffect(() => {
        const user = getAuthUser() as any;
        if (user) {
            setForm(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
        }
    }, []);

    // Handle program_id from URL
    useEffect(() => {
        const queryProgramId = searchParams.get("program_id");
        if (queryProgramId) {
            setForm(prev => ({ ...prev, program_id: queryProgramId }));
            const formElement = document.getElementById("donate-form-section");
            if (formElement) {
                setTimeout(() => {
                    formElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 500);
            }
        }
    }, [searchParams]);

    // Handle Return from Midtrans Redirect
    useEffect(() => {
        const orderId = searchParams.get("order_id");
        const transactionStatus = searchParams.get("transaction_status");

        if (orderId && orderId.startsWith("DPF-")) {
            const formElement = document.getElementById("donate-form-section");
            if (formElement) {
                setTimeout(() => {
                    formElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 500);
            }

            // Cleanup URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("order_id");
            newParams.delete("status_code");
            newParams.delete("transaction_status");
            newParams.delete("merchant_id");
            window.history.replaceState({}, '', `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`);

            const isRealSuccess = transactionStatus === "settlement" || transactionStatus === "capture";
            sessionStorage.removeItem('dpf_pending_donation_id');
            sessionStorage.removeItem('dpf_pending_order_id');

            if (isRealSuccess) {
                setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                setShowSuccessOverlay(true);
                setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                http.post(`/donations/check-by-order`, {
                    order_id: orderId,
                    snap_result: { transaction_status: "settlement", fraud_status: "accept" },
                    force_paid: true
                }).catch(console.error);
            } else {
                setShowFailedOverlay(true);
                http.post(`/donations/check-by-order`, {
                    order_id: orderId,
                    snap_result: { transaction_status: "cancel" }
                }).catch(console.error);
            }
        }
    }, [searchParams]);

    // Logic for polling and manual check
    const handleCheckPaymentStatus = async () => {
        const pendingDonationId = pendingDonationIdRef.current || sessionStorage.getItem('dpf_pending_donation_id');
        if (!pendingDonationId) return;
        setCheckingPayment(true);
        try {
            const statusRes = await http.post(`/donations/${pendingDonationId}/check-status`);
            if (statusRes.data?.status === 'paid') {
                sessionStorage.removeItem('dpf_pending_donation_id');
                sessionStorage.removeItem('dpf_pending_order_id');
                setShowPendingBanner(false);
                setShowSuccessOverlay(true);
                setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
            } else {
                alert("Pembayaran belum terkonfirmasi oleh sistem. Jika Anda sudah membayar, mohon tunggu beberapa saat dan coba lagi.");
            }
        } catch {
            alert("Gagal memeriksa status pembayaran. Coba lagi.");
        } finally {
            setCheckingPayment(false);
        }
    };

    const pollPaymentStatus = async (donationId: number | string) => {
        if (!donationId) return;
        const isOrderId = typeof donationId === 'string' && donationId.startsWith('DPF-');
        const maxRetries = 100;
        const delay = 3000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                let statusRes;
                if (isOrderId) {
                     statusRes = await http.post(`/donations/check-by-order`, { order_id: donationId });
                } else {
                     statusRes = await http.post(`/donations/${donationId}/check-status`);
                }
                const status = statusRes.data?.status;
                if (status === 'paid') {
                    setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                    setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                    break;
                }
                if (['failed', 'expired', 'refunded'].includes(status)) {
                    setSubmitState({ type: "error", messageKey: "donate.form.status.failed" });
                    break;
                }
            } catch (e) { console.error("Polling error", e); }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    // Form Handlers
    const handleChange = (key: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setFormErrors(prev => ({ ...prev, [key]: "" }));
        setSubmitState({ type: null, messageKey: null });
    };

    const validate = () => {
        const next: { [k: string]: string } = {};
        const alphaSpace = /^[A-Za-z\s]+$/;
        const digits = /^[0-9]+$/;
        if (!form.name.trim()) next.name = "donate.form.error.name.required";
        else if (!alphaSpace.test(form.name.trim())) next.name = "donate.form.error.name.alpha";
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "donate.form.error.email.invalid";
        if (!form.phone?.trim()) next.phone = "donate.form.error.phone.required";
        else if (form.phone.length < 8) next.phone = "donate.form.error.phone.numeric";
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
        try {
            const res = await http.post("/donations", {
                program_id: form.program_id || undefined,
                donor_name: form.name,
                donor_email: form.email || undefined,
                donor_phone: form.phone || undefined,
                amount: Number(form.amount),
                is_anonymous: form.is_anonymous,
                notes: form.notes || undefined,
                user_id: getAuthUser()?.id || undefined,
            });

            if (res.data?.donation?.id) currentDonationIdRef.current = res.data.donation.id;

            const snapToken = res.data?.snap_token;
            if (!snapToken) {
                setSubmitState({ type: "error", messageKey: "donate.form.status.noToken" });
                return;
            }

            if (res.data?.redirect_url) {
                sessionStorage.setItem('dpf_pending_donation_id', String(res.data?.donation?.id));
                sessionStorage.setItem('dpf_pending_order_id', String(res.data?.donation?.midtrans_order_id));
                window.location.href = res.data.redirect_url;
            } else {
                const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
                await ensureSnapLoaded(clientKey);
                pollPaymentStatus(res.data?.donation?.id);
                pendingDonationIdRef.current = res.data?.donation?.id;

                window.snap.pay(snapToken, {
                    onSuccess: async (result: any) => {
                        snapSuccessFiredRef.current = true;
                        setSubmitState({ type: "success", messageKey: "donate.form.status.success" });
                        setShowSuccessOverlay(true);
                        setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                        http.post(`/donations/${res.data?.donation?.id}/check-status`, { snap_result: result }).catch(() => {});
                    },
                    onPending: async (result: any) => {
                        const isBankTransfer = (result?.payment_type === 'bank_transfer' || result?.payment_type === 'echannel');
                        if (!isBankTransfer) {
                            snapSuccessFiredRef.current = true;
                            setSubmitState({ type: "success", messageKey: "donate.form.status.ewalletProcessing" });
                            setShowSuccessOverlay(true);
                            setForm(prev => ({ ...prev, amount: "", name: "", email: "", phone: "", notes: "", is_anonymous: false }));
                            http.post(`/donations/${res.data?.donation?.id}/check-status`, { 
                                snap_result: { transaction_status: "settlement", fraud_status: "accept", payment_type: result.payment_type } 
                            }).catch(() => {});
                        } else {
                            setSubmitState({ type: "success", messageKey: "donate.form.status.pending" });
                        }
                    },
                    onClose: () => {
                        if (snapSuccessFiredRef.current) return;
                        setShowFailedOverlay(true);
                        http.post(`/donations/check-by-order`, {
                            order_id: res.data?.donation?.midtrans_order_id,
                            snap_result: { transaction_status: "cancel" }
                        }).catch(() => {});
                    },
                });
            }
        } catch { setSubmitState({ type: "error", messageKey: "donate.form.status.error" });
        } finally { setSubmitting(false); }
    };

    // Localize Programs based on current locale
    const localizedPrograms = useMemo(() => {
        return programs.map((p) => ({
            ...p,
            title: pickLocale(p.title, p.title_en, locale as any),
            short_description: pickLocale(p.short_description, p.short_description_en, locale as any),
            category: pickLocale(p.category, p.category_en, locale as any),
        }));
    }, [programs, locale]);

    // Derived States
    const selectedProgram = localizedPrograms.find((p) => String(p.id) === form.program_id) || null;
    const selectedProgramImage = getImageUrl(selectedProgram?.program_images?.[0] || selectedProgram?.banner_path || selectedProgram?.thumbnail_path) || "";
    
    const visibleAccounts = accounts.filter(a => a.is_visible !== false);

    const groupedAccounts = useMemo(() => {
        const groups: Record<string, BankAccount[]> = {};
        visibleAccounts.forEach(acc => {
            const cat = acc.category || 'bank_transfer';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(acc);
        });
        return groups;
    }, [visibleAccounts]);

    const sortedCategories = Object.keys(groupedAccounts).sort((a, b) => 
        ['bank_transfer', 'virtual_account', 'ewallet', 'qris', 'other'].indexOf(a) - 
        ['bank_transfer', 'virtual_account', 'ewallet', 'qris', 'other'].indexOf(b)
    );

    const STEPS = [
        { titleKey: "donate.steps.1.title", descKey: "donate.steps.1.desc", icon: faCheckCircle },
        { titleKey: "donate.steps.2.title", descKey: "donate.steps.2.desc", icon: faWallet },
        { titleKey: "donate.steps.3.title", descKey: "donate.steps.3.desc", icon: faPaperPlane },
    ];

    const categoryLabels: Record<string, string> = {
        bank_transfer: "Transfer Bank",
        domestic: "Transfer Bank",
        international: "Transfer Internasional",
        ewallet: "E-Wallet",
        qris: "QRIS",
        virtual_account: "Virtual Account",
        other: "Lainnya"
    };

    return (
        <LandingLayout footerWaveBgClassName="bg-slate-50">
            <PageHero
                title={
                    <>
                        {t("donate.hero.title.leading")}{" "}
                        <span className="text-primary-500">{t("donate.hero.title.highlight")}</span>
                    </>
                }
                subtitle={t("donate.hero.subtitle")}
                badge={t("donate.hero.badge")}
                fullHeight={true}
                rightElement={
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
                }
            >

            </PageHero>

            {/* DONASI ONLINE */}
            <section id="donate-form-section" className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
                        <div className="space-y-6">
                            <ProgramShowcase
                                isGeneralDonation={!form.program_id}
                                selectedProgramImage={selectedProgramImage}
                                selectedProgramTitle={selectedProgram?.title || t("donate.program.empty.title")}
                                selectedProgramDesc={selectedProgram?.short_description || t("donate.program.empty.desc")}
                                selectedProgramStatus={normalizeProgramStatus(selectedProgram?.status, locale, t)}
                                selectedProgramCategory={selectedProgram?.category || null}
                                hasProgramProgress={!!(selectedProgram?.target_amount || selectedProgram?.collected_amount)}
                                displayCollected={selectedProgram?.collected_amount}
                                displayTarget={selectedProgram?.target_amount}
                                displayProgress={Math.min(100, Math.round((Number(selectedProgram?.collected_amount || 0) / Number(selectedProgram?.target_amount || 1)) * 100))}
                                detailLink={selectedProgram?.slug ? `/program/${selectedProgram.slug}` : "/program"}
                                t={t}
                            />
                        </div>

                        <DonationForm
                            form={form}
                            formErrors={formErrors}
                            submitting={submitting}
                            submitState={submitState}
                            localizedPrograms={localizedPrograms}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            t={t}
                        />
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
                                    <div className="relative h-full flex flex-col bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="relative mb-4">
                                            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-xl bg-brandGreen-600 text-white shadow-sm">
                                                <FontAwesomeIcon icon={step.icon} className="text-xl" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold border-2 border-white">
                                                {idx + 1}
                                            </div>
                                        </div>
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

            {/* QUOTE SLIDESHOW */}
            <QuoteSlideshow />

            {/* REKENING */}
            <BankAccountsSection
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                loading={loading}
                errorKey={errorKey}
                visibleAccounts={visibleAccounts}
                sortedCategories={sortedCategories}
                groupedAccounts={groupedAccounts}
                categoryLabels={categoryLabels}
                setQrisImage={setQrisImage}
                t={t}
            />

            {/* CTA */}
            <section className="bg-white pb-20">
                <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-100 bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-12 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)] sm:px-10">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                        <div className="space-y-4 max-w-2xl">
                            <p className="text-sm font-bold uppercase tracking-widest text-emerald-50 opacity-90">{t("donate.cta.badge")}</p>
                            <h3 className="text-3xl font-heading font-bold leading-tight sm:text-4xl">{t("donate.cta.heading")}</h3>
                            <p className="text-base text-emerald-50/90 leading-relaxed font-medium">{t("donate.cta.subtitle")}</p>
                        </div>
                    </div>
                </div>
            </section>

            <PaymentStatusOverlays
                showSuccessOverlay={showSuccessOverlay}
                setShowSuccessOverlay={setShowSuccessOverlay}
                showFailedOverlay={showFailedOverlay}
                setShowFailedOverlay={setShowFailedOverlay}
                showDanaConfirm={showDanaConfirm}
                setShowDanaConfirm={setShowDanaConfirm}
                showPendingBanner={showPendingBanner}
                setShowPendingBanner={setShowPendingBanner}
                checkingPayment={checkingPayment}
                onCheckPaymentStatus={handleCheckPaymentStatus}
                t={t}
            />

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
                                <FontAwesomeIcon icon={faTimesCircle} />
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
};

export default DonatePage;
export { DonatePage };
