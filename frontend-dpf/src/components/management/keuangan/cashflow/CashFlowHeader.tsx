import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileExcel,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

type CashFlowHeaderProps = {
  exporting: boolean;
  onExport: (format: "pdf" | "excel") => void;
  onRefresh: () => void;
  loading: boolean;
};

export function CashFlowHeader({
  exporting,
  onExport,
  onRefresh,
  loading,
}: CashFlowHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Laporan Arus Kas & Pembukuan Yayasan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Konsolidasi arus kas masuk (donasi terverifikasi), arus kas keluar (penyaluran), dan rekapitulasi saldo program.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            title="Muat Ulang Data"
          >
            <FontAwesomeIcon icon={faRotateRight} className={`text-xs ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => onExport("excel")}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faFileExcel} className="text-xs" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onExport("pdf")}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faFilePdf} className="text-xs" />
            <span>Export PDF Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
