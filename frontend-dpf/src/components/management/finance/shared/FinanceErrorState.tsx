import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";

export interface FinanceErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function FinanceErrorState({
  title = "Gagal Memuat Data",
  message = "Terjadi gangguan saat mengambil data dari server. Periksa koneksi Anda dan coba lagi.",
  onRetry,
  className = "",
}: FinanceErrorStateProps) {
  return (
    <div
      className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-slate-800 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xl" />
          </div>
          <div>
            <h4 className="font-heading text-base font-bold text-rose-900">{title}</h4>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-rose-700/90 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-700 border border-rose-200 shadow-xs transition hover:bg-rose-100/50 active:scale-95 shrink-0"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

export default FinanceErrorState;
