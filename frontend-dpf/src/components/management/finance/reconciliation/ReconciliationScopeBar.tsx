import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClock,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { SearchableSelect } from "@/components/management/finance/shared";
import type { AccountingPeriod } from "@/types/finance";
import { formatReconciliationTimestamp } from "./reconciliationHelpers";

interface ReconciliationScopeBarProps {
  periods: AccountingPeriod[];
  selectedPeriodId: number | "";
  onPeriodChange: (id: number | "") => void;
  lastCheckedAt?: string | null;
  refreshingRead: boolean;
  runningReconciliation: boolean;
  onRefreshRead: () => void;
}

export const ReconciliationScopeBar: React.FC<ReconciliationScopeBarProps> = ({
  periods,
  selectedPeriodId,
  onPeriodChange,
  lastCheckedAt,
  refreshingRead,
  runningReconciliation,
  onRefreshRead,
}) => {
  const periodOptions = [
    { value: "" as const, label: "Semua Periode (Global)" },
    ...periods.map((p) => {
      const pName = p.name || p.period_name || `Periode #${p.id}`;
      const isClosed =
        (p.status || "").toLowerCase() === "closed" ||
        (p.status || "").toLowerCase() === "ditutup";
      return {
        value: p.id,
        label: pName,
        badge: isClosed ? "Ditutup" : "Aktif",
        badgeColor: isClosed
          ? "bg-slate-700 text-white"
          : "bg-brandGreen-500 text-white",
      };
    }),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition sm:flex-row sm:items-center sm:justify-between">
      {/* Scope / Period Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="recon-period-select" className="text-xs font-bold text-slate-700 shrink-0">
          Periode Akuntansi:
        </label>

        <div className="w-64 sm:w-72">
          <SearchableSelect<number | "">
            id="recon-period-select"
            value={selectedPeriodId}
            onChange={(val) => onPeriodChange(val === "" ? "" : Number(val))}
            options={periodOptions}
            placeholder="Pilih Periode Akuntansi"
            searchPlaceholder="Cari nama atau tahun..."
            disabled={runningReconciliation}
            size="sm"
            icon={faCalendarDays}
          />
        </div>
      </div>

      {/* Right: Last Checked & Segarkan Hasil (Zero-write) */}
      <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
        {lastCheckedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[11px]" />
            <span className="text-[11px] text-slate-400 font-medium">Terakhir diperiksa:</span>
            <span className="font-semibold text-slate-700">
              {formatReconciliationTimestamp(lastCheckedAt)}
            </span>
          </div>
        )}

        {/* Segarkan Hasil (Zero-write Read) */}
        <button
          type="button"
          onClick={onRefreshRead}
          disabled={refreshingRead || runningReconciliation}
          title="Segarkan pembacaan status rekonsiliasi tanpa mencatat audit baru"
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshingRead ? "animate-spin text-slate-400 text-xs" : "text-slate-500 text-xs"}
          />
          <span>{refreshingRead ? "Menyegarkan..." : "Segarkan Hasil"}</span>
        </button>
      </div>
    </div>
  );
};
