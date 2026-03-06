import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faWallet, 
    faMapMarkerAlt, 
    faGlobe, 
    faCircleExclamation,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { AccountCard, AccountSkeleton } from "./DonateUI";

interface BankAccountsSectionProps {
    wakifLocation: 'domestic' | 'international';
    setWakifLocation: (loc: 'domestic' | 'international') => void;
    activeCategory: string | null;
    setActiveCategory: (cat: string | null) => void;
    loading: boolean;
    errorKey: string | null;
    visibleAccounts: any[];
    sortedCategories: string[];
    groupedAccounts: Record<string, any[]>;
    categoryLabels: Record<string, string>;
    setQrisImage: (img: string | null) => void;
    t: (key: string, fallback?: string) => string;
}

export const BankAccountsSection = ({
    wakifLocation,
    setWakifLocation,
    activeCategory,
    setActiveCategory,
    loading,
    errorKey,
    visibleAccounts,
    sortedCategories,
    groupedAccounts,
    categoryLabels,
    setQrisImage,
    t
}: BankAccountsSectionProps) => {
    return (
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
                        <p className="text-xs font-bold text-brandGreen-700">{t("donate.accounts.badge", "Donasi Manual")}</p>
                        <h2 className="text-2xl font-body font-semibold text-slate-900">{t("donate.accounts.heading", "Rekening Resmi")}</h2>
                    </div>
                </div>

                {errorKey && (
                    <div className="mt-8 overflow-hidden rounded-[24px] border border-red-100 bg-red-50/50 p-4 backdrop-blur-sm mb-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm ring-4 ring-red-50/50">
                                <FontAwesomeIcon icon={faCircleExclamation} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-red-900">{t("donate.accounts.error.title", "Error")}</h4>
                                <p className="text-sm leading-relaxed text-red-700/80">
                                    {t(errorKey)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-12">
                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, idx) => <AccountSkeleton key={`acc-skel-${idx}`} />)}
                        </div>
                    ) : visibleAccounts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            {t("donate.accounts.empty", "Tidak ada akun bank yang tersedia.")}
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
                        {t("donate.accounts.note", "Punya pertanyaan?")}{" "}
                        <a className="text-brandGreen-700 underline decoration-2 underline-offset-2 hover:text-brandGreen-800" href="/konfirmasi-donasi">
                            {t("donate.accounts.note.link", "Konfirmasi Donasi")}
                        </a>{" "}
                        {t("donate.accounts.note.suffix", "di sini.")}
                    </p>
                </div>
            </div>
        </section>
    );
};
