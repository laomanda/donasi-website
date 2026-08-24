import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCreditCard,
    faExclamationTriangle,
    faLock,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { InputField, SelectField } from "./DonateUI";
import PhoneInput from "../ui/PhoneInput";
import { Link } from "react-router-dom";
import { formatNumber } from "@/lib/utils";

const amountOptions = [50000, 100000, 250000, 500000];

interface DonationFormProps {
    form: {
        program_id: string;
        amount: string;
        name: string;
        email: string;
        phone: string;
        notes: string;
        is_anonymous: boolean;
    };
    formErrors: Record<string, string>;
    submitting: boolean;
    submitState: { type: "success" | "error" | null; messageKey: string | null };
    localizedPrograms: any[];
    handleChange: (key: any, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    t: (key: string, fallback?: string) => string;
}

export const DonationForm = ({
    form,
    formErrors,
    submitting: _submitting,
    submitState,
    localizedPrograms,
    handleChange,
    handleSubmit: _handleSubmit,
    t
}: DonationFormProps) => {
    return (
        <div className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-5">
            {/* Midtrans Development Notice Banner */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 shrink-0 text-base" />
                    <span>Pembayaran Online Midtrans Dalam Pengembangan</span>
                </div>
                <p className="text-xs text-amber-950/80 leading-relaxed font-medium">
                    Fitur donasi otomatis via Midtrans (QRIS, E-Wallet & Virtual Account) saat ini masih dalam tahap penyiapan & verifikasi sistem.
                </p>
                <div className="pt-1">
                    <Link 
                        to="/konfirmasi-donasi" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-700 hover:text-brandGreen-800 underline decoration-brandGreen-300 underline-offset-4 transition"
                    >
                        <span>Gunakan Transfer Bank Manual & Konfirmasi Donasi</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </Link>
                </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <SelectField
                    label={t("donate.form.selectLabel", "Pilih Program")}
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
                    label={t("donate.form.name", "Nama Lengkap")}
                    value={form.name}
                    onChange={(v) => handleChange("name", v)}
                    required
                    error={formErrors.name ? t(formErrors.name) : ""}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                        label={t("donate.form.email", "Email")}
                        value={form.email}
                        onChange={(v) => handleChange("email", v)}
                        error={formErrors.email ? t(formErrors.email) : ""}
                    />
                    <PhoneInput
                        label={t("donate.form.phone", "Nomor Telepon")}
                        value={form.phone}
                        onChange={(v) => handleChange("phone", v || "")}
                        error={formErrors.phone ? t(formErrors.phone) : ""}
                        required
                    />
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">{t("donate.form.quickPick", "Pilih Nominal Cepat")}</p>
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
                    label={t("donate.form.amount", "Nominal Donasi")}
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
                    {t("donate.form.anonymous", "Sembunyikan nama saya (Hamba Allah)")}
                </label>
                <InputField label={t("donate.form.notes", "Pesan atau Doa (Opsional)")} value={form.notes} onChange={(v) => handleChange("notes", v)} />

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

                {/* Disabled Midtrans Submit Button */}
                <div className="space-y-2 pt-2">
                    <button
                        type="button"
                        disabled={true}
                        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-400 shadow-none transition"
                    >
                        <FontAwesomeIcon icon={faLock} className="text-slate-400" />
                        <span>Pembayaran Online (Midtrans) - Dalam Pemeliharaan</span>
                    </button>

                    {/* Primary Action Button: Transfer Bank Manual */}
                    <Link
                        to="/konfirmasi-donasi"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brandGreen-600/20 transition hover:bg-brandGreen-700 hover:-translate-y-0.5"
                    >
                        <FontAwesomeIcon icon={faCreditCard} />
                        <span>Donasi via Transfer Bank Manual & Konfirmasi</span>
                    </Link>
                </div>

                <p className="text-xs text-center text-slate-500 pt-1">
                    Silakan gunakan{" "}
                    <Link to="/konfirmasi-donasi" className="font-bold text-brandGreen-700 hover:underline">
                        Transfer Bank Manual
                    </Link>{" "}
                    atau hubungi tim DPF untuk informasi donasi.
                </p>
            </form>
        </div>
    );
};

