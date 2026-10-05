import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingHeart,
  faFileInvoiceDollar,
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";

interface ActivityStatementSummaryProps {
  totalRevenues: number;
  totalExpenses: number;
  surplusDeficit: number;
  isSurplus: boolean;
  revenueCount: number;
  expenseCount: number;
}

export const ActivityStatementSummary: React.FC<ActivityStatementSummaryProps> = ({
  totalRevenues,
  totalExpenses,
  surplusDeficit,
  isSurplus,
  revenueCount,
  expenseCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
      {/* 1. Total Penerimaan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 border-t-brandGreen-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL PENERIMAAN
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-brandGreen-600">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs" />
          </div>
        </div>
        <div>
          <p
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
            title={formatRupiah(totalRevenues)}
          >
            {formatRupiah(totalRevenues)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {revenueCount} akun penerimaan aktif
          </p>
        </div>
      </div>

      {/* 2. Total Beban & Penyaluran */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 border-t-primary-600 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL BEBAN & PENYALURAN
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-primary-600">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
          </div>
        </div>
        <div>
          <p
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
            title={formatRupiah(totalExpenses)}
          >
            {formatRupiah(totalExpenses)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {expenseCount} pos beban & program
          </p>
        </div>
      </div>

      {/* 3. Surplus / (Defisit) Berjalan */}
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 space-y-2 ${
          isSurplus ? "border-t-brandGreen-500" : "border-t-brandWarmOrange-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            SURPLUS / (DEFISIT) BERJALAN
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
              isSurplus ? "bg-brandGreen-500" : "bg-brandWarmOrange-500"
            }`}
          >
            <FontAwesomeIcon
              icon={isSurplus ? faArrowTrendUp : faArrowTrendDown}
              className="text-xs"
            />
          </div>
        </div>
        <div>
          <p
            className={`font-mono text-lg sm:text-xl font-bold truncate tabular-nums ${
              isSurplus ? "text-brandGreen-600" : "text-brandWarmOrange-600"
            }`}
            title={formatRupiah(surplusDeficit)}
          >
            {formatRupiah(surplusDeficit)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {isSurplus
              ? "Hasil operasional periode ini surplus"
              : "Hasil operasional periode ini defisit"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatementSummary;
