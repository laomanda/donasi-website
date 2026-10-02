import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScaleBalanced,
  faScaleUnbalanced,
  faArrowRight,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface TrialBalanceStatusProps {
  isBalanced: boolean;
  periodId?: number | "";
  startDate?: string;
  endDate?: string;
}

export const TrialBalanceStatus: React.FC<TrialBalanceStatusProps> = ({
  isBalanced,
  periodId,
  startDate,
  endDate,
}) => {
  // Build query for Buku Besar
  const glParams = new URLSearchParams();
  if (periodId) glParams.set("period_id", String(periodId));
  if (startDate) glParams.set("start_date", startDate);
  if (endDate) glParams.set("end_date", endDate);
  const glSearch = glParams.toString();
  const glUrl = `/finance/general-ledger${glSearch ? `?${glSearch}` : ""}`;

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-xs transition ${
        isBalanced
          ? "border-brandGreen-500/40 border-l-4 border-l-brandGreen-500"
          : "border-rose-300 border-l-4 border-l-rose-600"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
              isBalanced ? "bg-brandGreen-500" : "bg-rose-600"
            }`}
          >
            <FontAwesomeIcon
              icon={isBalanced ? faScaleBalanced : faScaleUnbalanced}
              className="text-base"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                {isBalanced
                  ? "Neraca Saldo Seimbang"
                  : "Neraca Saldo Belum Seimbang"}
              </h4>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                  isBalanced ? "bg-brandGreen-500" : "bg-rose-600"
                }`}
              >
                <FontAwesomeIcon
                  icon={isBalanced ? faCheckCircle : faExclamationTriangle}
                  className="text-[9px]"
                />
                {isBalanced ? "Seimbang" : "Tidak Seimbang"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {isBalanced
                ? "Saldo debit dan kredit telah dinyatakan seimbang oleh sistem berdasarkan seluruh jurnal yang telah diposting."
                : "Periksa transaksi dan modul Rekonsiliasi Keuangan untuk meninjau ketidaksesuaian pembukuan."}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {!isBalanced && (
            <Link
              to="/finance/reconciliation"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition active:scale-95"
            >
              <span>Buka Rekonsiliasi</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          )}

          <Link
            to={glUrl}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95"
          >
            <span>Buku Besar</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceStatus;
