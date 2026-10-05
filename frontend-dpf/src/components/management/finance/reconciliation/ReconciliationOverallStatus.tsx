import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faTriangleExclamation,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationSummary, ReconciliationReport } from "@/types/finance";
import { ReconciliationStatusBadge } from "./ReconciliationStatusBadge";
import { formatNumber } from "@/utils/financeUtils";

interface ReconciliationOverallStatusProps {
  summary: ReconciliationSummary | null;
  report: ReconciliationReport | null;
  loading: boolean;
}

export const ReconciliationOverallStatus: React.FC<ReconciliationOverallStatusProps> = ({
  summary,
  report,
  loading,
}) => {
  if (loading && !summary && !report) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // Derive counts truthfully from report (if available) or summary
  const overallStatus = report?.overall_status ?? summary?.overall_status ?? null;
  const totalChecks = report?.total_checks ?? summary?.total_checks ?? report?.checks?.length ?? 0;
  const passedChecks = report?.passed_checks ?? summary?.passed_checks ?? (totalChecks - ((summary?.failed_checks ?? 0)));
  const failedChecks = report?.failed_checks ?? summary?.failed_checks ?? 0;
  const warnings = report?.warnings ?? summary?.warnings ?? 0;
  const criticalErrors = report?.critical_errors ?? summary?.critical_errors ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition space-y-5">
      {/* Top Banner: Status + Truthful narrative */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Status Integritas Keuangan
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <ReconciliationStatusBadge status={overallStatus} />
            {totalChecks > 0 && (
              <span className="text-xs font-semibold text-slate-600">
                <strong className="text-slate-900">{passedChecks}</strong> dari{" "}
                <strong className="text-slate-900">{totalChecks}</strong> titik kontrol lulus
                {warnings > 0 && (
                  <span className="text-brandWarmOrange-600 font-bold ml-1">
                    ({warnings} peringatan)
                  </span>
                )}
                {criticalErrors > 0 && (
                  <span className="text-red-600 font-bold ml-1">
                    ({criticalErrors} kritis)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {totalChecks === 0 && (
          <span className="text-xs text-slate-500 italic">
            Belum ada hasil pemeriksaan untuk periode ini.
          </span>
        )}
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. Lulus */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brandGreen-500 text-white shadow-xs">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Kontrol Lulus
            </span>
            <p className="text-lg font-bold text-slate-900 font-poppins">
              {formatNumber(passedChecks)}
            </p>
          </div>
        </div>

        {/* 2. Peringatan */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brandWarmOrange-500 text-white shadow-xs">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Peringatan (Review)
            </span>
            <p className="text-lg font-bold text-slate-900 font-poppins">
              {formatNumber(warnings)}
            </p>
          </div>
        </div>

        {/* 3. Kritis / Anomali */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
            <FontAwesomeIcon icon={faCircleXmark} className="text-sm" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Anomali Kritis
            </span>
            <p className="text-lg font-bold text-slate-900 font-poppins">
              {formatNumber(criticalErrors > 0 ? criticalErrors : failedChecks)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
