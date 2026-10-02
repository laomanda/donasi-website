import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import type { ActivityStatementResponse } from "@/types/finance";
import { PanelContentSkeleton } from "./DashboardSectionSkeleton";

interface ActivitySummaryPanelProps {
  activityStatement: ActivityStatementResponse | null;
  totalRevenues: number;
  totalExpenses: number;
  surplusDeficit: number;
  isSurplus: boolean;
  selectedPeriodId: number | null;
  error?: string;
  loading: boolean;
}

export const ActivitySummaryPanel: React.FC<ActivitySummaryPanelProps> = ({
  activityStatement,
  totalRevenues,
  totalExpenses,
  surplusDeficit,
  isSurplus,
  selectedPeriodId,
  error,
  loading,
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-200 pb-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900">
              Aktivitas Periode
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Laporan Aktivitas (LA) penerimaan dan beban periode berjalan.
            </p>
          </div>
          {activityStatement && (
            <div className="shrink-0 self-start sm:self-center">
              <FinanceStatusBadge
                status={isSurplus ? "posted" : "warning"}
                label={
                  isSurplus ? "Surplus Operasional" : "Defisit Operasional"
                }
              />
            </div>
          )}
        </div>

        {error ? (
          <div className="py-4">
            <FinanceErrorState
              title="Aktivitas Periode Belum Dapat Dimuat"
              message={error}
            />
          </div>
        ) : loading ? (
          <PanelContentSkeleton rows={3} />
        ) : (
          <div className="divide-y divide-slate-200 py-1">
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                Total Penerimaan (Donasi & Hasil Kelola)
              </span>
              <CurrencyDisplay
                amount={totalRevenues}
                tone="debit"
                className="text-xs sm:text-sm font-bold text-brandGreen-700"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                Total Beban & Penyaluran Manfaat
              </span>
              <CurrencyDisplay
                amount={totalExpenses}
                tone="credit"
                className="text-xs sm:text-sm font-bold text-rose-600"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-bold text-slate-800">
                {isSurplus
                  ? "Surplus Periode Berjalan"
                  : "Defisit Periode Berjalan"}
              </span>
              <CurrencyDisplay
                amount={surplusDeficit}
                tone="auto"
                className="text-xs sm:text-sm font-bold"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl mt-2.5 text-xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hasil Bersih Periode
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs ${
                  isSurplus
                    ? "bg-brandGreen-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {isSurplus ? "Surplus Terbuku" : "Defisit Terbuku"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3.5">
        <Link
          to={
            selectedPeriodId
              ? `/finance/activity-statement?period_id=${selectedPeriodId}`
              : "/finance/activity-statement"
          }
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
        >
          Lihat Laporan Aktivitas Lengkap
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-[10px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
};

export default ActivitySummaryPanel;
