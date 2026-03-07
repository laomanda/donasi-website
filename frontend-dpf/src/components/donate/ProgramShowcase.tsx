import { Link } from "react-router-dom";
import { dpfIcon } from "@/assets/brand";

interface ProgramShowcaseProps {
    isGeneralDonation: boolean;
    selectedProgramImage: string;
    selectedProgramTitle: string;
    selectedProgramDesc: string;
    selectedProgramStatus: string;
    selectedProgramCategory: string | null;
    hasProgramProgress: boolean;
    displayCollected: number | null;
    displayTarget: number | null;
    displayProgress: number;
    detailLink: string;
    t: (key: string, fallback?: string) => string;
}

const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
};

export const ProgramShowcase = ({
    isGeneralDonation,
    selectedProgramImage,
    selectedProgramTitle,
    selectedProgramDesc,
    selectedProgramStatus,
    selectedProgramCategory,
    hasProgramProgress,
    displayCollected,
    displayTarget,
    displayProgress,
    detailLink,
    t
}: ProgramShowcaseProps) => {
    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
            <div className="relative">
                <img
                    src={selectedProgramImage || dpfIcon}
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
                                        {t("donate.card.collected", "Terkumpul")}{" "}
                                        <span className="font-semibold text-slate-700">
                                            {hasProgramProgress ? formatCurrency(displayCollected || 0) : formatCurrency(0)}
                                        </span>
                                    </span>
                                    <span>
                                        {t("donate.card.target", "Target")}{" "}
                                        <span className="font-semibold text-slate-700">
                                            {hasProgramProgress && displayTarget !== null
                                                ? formatCurrency(displayTarget)
                                                : t("donate.card.flexible", "Target Fleksibel")}
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
                                        {t("donate.program.empty.cta", "Lihat Program")}
                                    </a>
                                ) : (
                                    <Link
                                        to={detailLink}
                                        className="inline-flex items-center justify-center rounded-full border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brandGreen-700 hover:to-primary-700"
                                    >
                                        {t("donate.card.detail", "Selengkapnya")}
                                    </Link>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
