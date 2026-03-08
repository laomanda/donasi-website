import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface AdminDonationHeaderProps {
  onInputManual: () => void;
}

export function AdminDonationHeader({ onInputManual }: AdminDonationHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 shadow-lg md:p-10">
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
            Operasional
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl text-shadow-sm">
            Donasi Masuk
          </h1>
          <p className="mt-2 max-w-2xl text-emerald-100 font-medium text-lg">
            Kelola seluruh transaksi donasi, verifikasi pembayaran, dan pantau arus dana masuk secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onInputManual}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-200">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
            </span>
            Input Manual
          </button>
        </div>
      </div>

      {/* Abstract Background Decoration */}
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
    </div>
  );
}

export default AdminDonationHeader;
