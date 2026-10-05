import React from "react";

interface AccountingPeriodStatusBadgeProps {
  status: string;
  className?: string;
}

export const AccountingPeriodStatusBadge: React.FC<AccountingPeriodStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const normalized = (status || "").toLowerCase().trim();

  if (normalized === "open" || normalized === "aktif") {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-brandGreen-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs tracking-wide ${className}`}
      >
        Aktif
      </span>
    );
  }

  if (normalized === "closed" || normalized === "ditutup") {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs tracking-wide ${className}`}
      >
        Ditutup
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-slate-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs tracking-wide ${className}`}
    >
      {status || "—"}
    </span>
  );
};
