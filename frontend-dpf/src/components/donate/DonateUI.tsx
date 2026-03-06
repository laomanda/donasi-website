import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faQrcode
} from "@fortawesome/free-solid-svg-icons";
import { resolveStorageBaseUrl } from "@/lib/urls";

export interface BankAccount {
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
}

export const getImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const baseUrl = resolveStorageBaseUrl();
    return `${baseUrl}/${path}`; 
};

export const InfoPill = ({ icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-50 text-brandGreen-700">
            <FontAwesomeIcon icon={icon} />
        </span>
        <span>{label}</span>
    </div>
);

export const AccountCard = ({
    account,
    t,
    onShowQris,
}: {
    account: BankAccount;
    t: (key: string, fallback?: string) => string;
    onShowQris: (url: string) => void;
}) => {
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
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("donate.accounts.bankLabel", "Nama Bank")}</p>
                        <p className="text-base font-body font-bold text-slate-900 leading-tight">{account.bank_name}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("donate.accounts.number", "Nomor Rekening")}</p>
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
                    <span className="text-xs font-semibold text-slate-500">{t("donate.accounts.holder", "Atas Nama")}</span>
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
};

export const AccountSkeleton = () => (
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

export const SelectField = ({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; disabled?: boolean }[];
}) => (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
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

export const InputField = ({
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
}) => {
    const base =
        "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
    const state = error
        ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
        : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
    return (
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
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
};
