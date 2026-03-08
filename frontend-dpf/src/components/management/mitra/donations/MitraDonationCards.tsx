import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { MitraStatusBadge } from "../shared/MitraStatusBadge";
import { formatIDR, formatDateShort } from "../shared/MitraUtils";

interface Donation {
  id: number;
  donation_code: string;
  amount: number;
  status: string;
  created_at: string;
  program?: {
    title: string;
    title_en: string | null;
  };
}

interface MitraDonationCardsProps {
  donations: Donation[];
  loading: boolean;
  locale: string;
  onDownloadInvoice: (id: number, code: string) => void;
  t: (key: string, fallback?: string) => string;
}

export function MitraDonationCards({
  donations,
  loading,
  locale,
  onDownloadInvoice,
  t,
}: MitraDonationCardsProps) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="px-6 py-24 text-center md:hidden">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
          <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
        </div>
        <h3 className="mt-6 text-base font-bold text-slate-900">
          {t("mitra.no_donation_history", "Belum ada riwayat donasi")}
        </h3>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {(Array.isArray(donations) ? donations : []).map((don) => (
        <div key={don.id} className="space-y-5 p-6 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t("mitra.donation_code", "Kode Donasi")}
              </p>
              <p className="text-sm font-bold uppercase text-slate-900">{don.donation_code}</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {formatDateShort(don.created_at, locale)}
              </p>
            </div>
            <MitraStatusBadge status={don.status} t={t} variant="solid" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("mitra.program", "Program")}
            </p>
            <p className="text-sm font-bold leading-snug text-slate-800">
              {locale === "en" && don.program?.title_en
                ? don.program.title_en
                : don.program?.title ?? t("mitra.general_donation", "Donasi Umum")}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-[20px] bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600">
              <FontAwesomeIcon icon={faReceipt} className="text-[10px]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("common.amount", "Nominal")}
              </span>
            </div>
            <span className="font-heading text-lg font-black text-emerald-700">
              {formatIDR(don.amount).replace("Rp", "Rp ")}
            </span>
          </div>

          {don.status === "paid" && (
            <div className="pt-2">
              <button
                onClick={() => onDownloadInvoice(don.id, don.donation_code)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                {t("mitra.download_invoice", "Download Invoice")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
