import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import type { BalanceSheetResponse } from "@/types/finance";
import { PanelContentSkeleton } from "./DashboardSectionSkeleton";

interface FinancialPositionPanelProps {
  balanceSheet: BalanceSheetResponse | null;
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  selectedPeriodId: number | null;
  error?: string;
  loading: boolean;
}

export const FinancialPositionPanel: React.FC<FinancialPositionPanelProps> = ({
  balanceSheet,
  totalAssets,
  totalLiabilities,
  totalNetAssets,
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
              Posisi Keuangan (Neraca)
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Laporan Posisi Keuangan (LP) per akhir periode terpilih.
            </p>
          </div>
          {balanceSheet && (
            <div className="shrink-0 self-start sm:self-center">
              <FinanceStatusBadge
                status={balanceSheet.is_balanced ? "balanced" : "warning"}
                label={
                  balanceSheet.is_balanced
                    ? "Neraca Seimbang"
                    : "Tidak Seimbang"
                }
              />
            </div>
          )}
        </div>

        {error ? (
          <div className="py-4">
            <FinanceErrorState
              title="Posisi Keuangan Belum Dapat Dimuat"
              message={error}
            />
          </div>
        ) : loading ? (
          <PanelContentSkeleton rows={3} />
        ) : (
          <div className="divide-y divide-slate-200 py-1">
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                Total Aset (Aktiva)
              </span>
              <CurrencyDisplay
                amount={totalAssets}
                className="text-xs sm:text-sm font-bold text-slate-900"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                Total Liabilitas (Kewajiban)
              </span>
              <CurrencyDisplay
                amount={totalLiabilities}
                className="text-xs sm:text-sm font-bold text-amber-700"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                Total Aset Neto Wakaf
              </span>
              <CurrencyDisplay
                amount={totalNetAssets}
                className="text-xs sm:text-sm font-bold text-brandGreen-700"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl mt-2.5 text-xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Liabilitas + Aset Neto
              </span>
              <CurrencyDisplay
                amount={totalLiabilities + totalNetAssets}
                className="text-xs sm:text-sm font-bold text-slate-900 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3.5">
        <Link
          to={
            selectedPeriodId
              ? `/finance/balance-sheet?period_id=${selectedPeriodId}`
              : "/finance/balance-sheet"
          }
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
        >
          Lihat Laporan Posisi Keuangan Lengkap
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-[10px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
};

export default FinancialPositionPanel;
