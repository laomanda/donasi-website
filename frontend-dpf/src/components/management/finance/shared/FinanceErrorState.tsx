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
      className={`rounded-2xl border border-rose-500 bg-rose-600 p-6 text-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 font-bold shadow-xs">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xl" />
          </div>
          <div>
            <h4 className="font-heading text-base font-bold text-white">{title}</h4>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-rose-100 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-95 shrink-0"
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
