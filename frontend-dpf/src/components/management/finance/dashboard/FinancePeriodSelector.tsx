import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { FinanceStatusBadge } from "@/components/management/finance/shared";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { AccountingPeriod } from "@/types/finance";

interface FinancePeriodSelectorProps {
  periods: AccountingPeriod[];
  selectedPeriodId: number | null;
  selectedPeriod: AccountingPeriod | null;
  onSelectPeriod: (id: number) => void;
}

export const FinancePeriodSelector: React.FC<FinancePeriodSelectorProps> = ({
  periods,
  selectedPeriodId,
  selectedPeriod,
  onSelectPeriod,
}) => {
  return (
    <nav
      aria-label="Kontrol Periode Akuntansi"
      className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:px-5 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white text-xs font-bold shadow-sm">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
          <label
            htmlFor="dashboard-period-select"
            className="text-xs font-bold text-slate-800 shrink-0"
          >
            Periode Akuntansi
          </label>
        </div>

        <select
          id="dashboard-period-select"
          aria-label="Pilih Periode Akuntansi"
          value={selectedPeriodId ?? ""}
          onChange={(e) => onSelectPeriod(Number(e.target.value))}
          className="w-full sm:w-auto cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 transition hover:border-slate-400 focus:border-brandGreen-500 focus:outline-hidden shadow-2xs"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.period_name || p.name || `Periode #${p.id}`} (
              {p.status === "open" ? "Terbuka" : "Ditutup"})
            </option>
          ))}
        </select>
      </div>

      {selectedPeriod && (
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="font-medium text-slate-600">
            <span className="text-slate-400 font-normal">Rentang:</span>{" "}
            {formatFinanceDate(selectedPeriod.start_date)} —{" "}
            {formatFinanceDate(selectedPeriod.end_date)}
          </span>
          <FinanceStatusBadge
            status={selectedPeriod.status === "open" ? "open" : "closed"}
            label={
              selectedPeriod.status === "open"
                ? "Pencatatan Aktif"
                : "Buku Ditutup"
            }
          />
        </div>
      )}
    </nav>
  );
};

export default FinancePeriodSelector;
