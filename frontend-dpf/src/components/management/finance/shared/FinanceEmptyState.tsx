import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

export interface FinanceEmptyStateProps {
  title?: string;
  description?: string;
  icon?: any;
  action?: ReactNode;
  className?: string;
}

export function FinanceEmptyState({
  title = "Belum Ada Data",
  description = "Belum ada catatan atau transaksi yang sesuai dengan filter yang dipilih.",
  icon = faFolderOpen,
  action,
  className = "",
}: FinanceEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4 ring-8 ring-slate-50">
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>

      <h3 className="font-heading text-base font-bold text-slate-800 sm:text-lg">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default FinanceEmptyState;
