import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";

interface ActivityStatementResultProps {
  surplusDeficit: number;
  isSurplus: boolean;
  totalRevenues: number;
  totalExpenses: number;
}

export const ActivityStatementResult: React.FC<ActivityStatementResultProps> = ({
  surplusDeficit,
  isSurplus,
  totalRevenues,
  totalExpenses,
}) => {
  return (
    <div
      className={`rounded-2xl border ${
        isSurplus
          ? "border-slate-200 border-t-4 border-t-brandGreen-500"
          : "border-brandWarmOrange-300 border-t-4 border-t-brandWarmOrange-500"
      } bg-white p-5 sm:p-6 shadow-xs print:border print:border-black print:rounded-none print:shadow-none mb-6`}
    >
      {/* Result Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs ${
              isSurplus ? "bg-brandGreen-500" : "bg-brandWarmOrange-500"
            }`}
          >
            <FontAwesomeIcon
              icon={isSurplus ? faArrowTrendUp : faArrowTrendDown}
              className="text-base"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Hasil Bersih Aktivitas
              </h3>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${
                  isSurplus ? "bg-brandGreen-500" : "bg-brandWarmOrange-500"
                }`}
              >
                {isSurplus ? "Surplus Berjalan" : "Defisit Berjalan"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Selisih antara total penerimaan dengan total beban dan penyaluran
            </p>
          </div>
        </div>

        {/* Final Result Metric */}
        <div className="text-left sm:text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isSurplus ? "Surplus Periode Berjalan" : "Defisit Periode Berjalan"}
          </span>
          <span
            className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
              isSurplus ? "text-brandGreen-600" : "text-brandWarmOrange-600"
            }`}
          >
            {formatRupiah(surplusDeficit)}
          </span>
        </div>
      </div>

      {/* Visual Component Breakdown for Layman Understanding */}
      <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 pt-4 text-center">
        {/* Total Penerimaan */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 text-left sm:text-center">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Penerimaan
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(totalRevenues)}
          </span>
        </div>

        {/* Minus Sign */}
        <div className="hidden sm:flex items-center justify-center font-mono text-lg font-bold text-slate-400">
          −
        </div>

        {/* Total Beban & Penyaluran */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 text-left sm:text-center">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Beban & Penyaluran
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Explanatory Message */}
      <div className="mt-3.5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 border border-slate-100">
        <p>
          <strong className="text-slate-800 font-semibold">Kesimpulan Operasional:</strong>{" "}
          {isSurplus
            ? "Periode berjalan menghasilkan surplus. Total penerimaan yang dihimpun tercatat lebih besar dibandingkan penyaluran dan beban operasional."
            : "Periode berjalan menghasilkan defisit. Pengeluaran beban dan penyaluran tercatat lebih besar dibandingkan penerimaan yang dihimpun."}
        </p>
      </div>
    </div>
  );
};

export default ActivityStatementResult;
