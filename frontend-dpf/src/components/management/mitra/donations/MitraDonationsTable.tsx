import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { MitraStatusBadge } from "../shared/MitraStatusBadge";
import { formatIDR, formatDateLong } from "../shared/MitraUtils";

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

interface MitraDonationsTableProps {
  donations: Donation[];
  loading: boolean;
  locale: string;
  onDownloadInvoice: (id: number, code: string) => void;
  t: (key: string, fallback?: string) => string;
}

export function MitraDonationsTable({
  donations,
  loading,
  locale,
  onDownloadInvoice,
  t,
}: MitraDonationsTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.donation_code", "Kode Donasi")}
            </th>
            <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.program", "Program")}
            </th>
            <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("common.status", "Status")}
            </th>
            <th className="px-8 py-6 text-right text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("common.amount", "Nominal")}
            </th>
            <th className="px-8 py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.invoice", "Invoice")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-8 py-8" colSpan={5}>
                  <div className="h-5 w-full rounded-lg bg-slate-50" />
                </td>
              </tr>
            ))
          ) : donations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-32 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {t("mitra.no_donation_history", "Belum ada riwayat donasi")}
                </h3>
                <p className="mt-2 text-slate-500">
                  {t("mitra.reset_filter_desc", "Coba ubah kata kunci atau periode filter Anda.")}
                </p>
              </td>
            </tr>
          ) : (
            (Array.isArray(donations) ? donations : []).map((don) => (
              <tr key={don.id} className="group transition-all hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-8 py-7">
                  <p className="tabular-nums font-bold uppercase text-slate-900">
                    {don.donation_code}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {formatDateLong(don.created_at, locale)}
                  </p>
                </td>
                <td className="px-8 py-7">
                  <p className="font-bold leading-relaxed text-slate-900">
                    {locale === "en" && don.program?.title_en
                      ? don.program.title_en
                      : don.program?.title ?? t("mitra.general_donation", "Donasi Umum")}
                  </p>
                </td>
                <td className="px-8 py-7">
                  <MitraStatusBadge status={don.status} t={t} variant="solid" />
                </td>
                <td className="px-8 py-7 text-right">
                  <span className="inline-block rounded-2xl bg-brandGreen-600 px-5 py-2 font-heading text-sm font-black tabular-nums text-white shadow-sm ring-1 ring-brandGreen-600">
                    {formatIDR(don.amount)}
                  </span>
                </td>
                <td className="px-8 py-7 text-center">
                  {don.status === "paid" ? (
                    <button
                      onClick={() => onDownloadInvoice(don.id, don.donation_code)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                    >
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
