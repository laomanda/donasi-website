import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

type DonationReportHeaderProps = {
  exporting: boolean;
  onExport: (format: "pdf" | "xlsx") => void;
};

export function DonationReportHeader({ exporting, onExport }: DonationReportHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                Laporan
              </span>
              <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                Laporan Donasi
              </h1>
              <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                Ringkasan dan daftar donasi berdasarkan rentang waktu serta sumber pembayaran.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onExport("pdf")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <FontAwesomeIcon icon={faFileArrowDown} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => onExport("xlsx")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FontAwesomeIcon icon={faFileArrowDown} />
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
