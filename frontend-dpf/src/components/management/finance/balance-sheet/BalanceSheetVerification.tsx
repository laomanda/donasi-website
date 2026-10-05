import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTriangleExclamation,
  faScaleBalanced,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";

interface BalanceSheetVerificationProps {
  isBalanced: boolean;
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  periodId?: number | "";
}

export const BalanceSheetVerification: React.FC<BalanceSheetVerificationProps> = ({
  isBalanced,
  totalAssets,
  totalLiabilities,
  totalNetAssets,
  periodId,
}) => {
  return (
    <div
      className={`rounded-2xl border ${
        isBalanced ? "border-slate-200 border-t-4 border-t-brandGreen-500" : "border-red-300 border-t-4 border-t-red-600"
      } bg-white p-5 sm:p-6 shadow-xs print:border print:border-black print:rounded-none print:shadow-none mb-6`}
    >
      {/* Header Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs ${
              isBalanced ? "bg-brandGreen-500" : "bg-red-600"
            }`}
          >
            <FontAwesomeIcon
              icon={isBalanced ? faCheckCircle : faTriangleExclamation}
              className="text-base"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Pemeriksaan Keseimbangan Neraca
              </h3>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${
                  isBalanced ? "bg-brandGreen-500" : "bg-red-600"
                }`}
              >
                {isBalanced ? "Neraca Seimbang" : "Tidak Seimbang"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Uji kesetaraan nilai: Total Aset = Total Liabilitas + Total Aset Neto
            </p>
          </div>
        </div>

        {/* Action Button if unbalanced */}
        {!isBalanced && (
          <div className="flex items-center gap-2 print:hidden self-start sm:self-center">
            <Link
              to={
                periodId
                  ? `/finance/trial-balance?period_id=${periodId}`
                  : "/finance/trial-balance"
              }
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
            >
              <FontAwesomeIcon
                icon={faScaleBalanced}
                className="text-xs text-slate-500"
              />
              <span>Periksa Neraca Saldo</span>
            </Link>
            <Link
              to="/finance/reconciliation"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 active:scale-95 transition"
            >
              <span>Rekonsiliasi</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        )}
      </div>

      {/* Visual Equation Cards for Layman Users */}
      <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 pt-4 text-center">
        {/* Total Aset */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 text-left sm:text-center">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Aset (Harta)
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(totalAssets)}
          </span>
        </div>

        {/* Equals Sign */}
        <div className="hidden sm:flex items-center justify-center font-mono text-lg font-bold text-slate-400">
          =
        </div>

        {/* Liabilitas + Aset Neto */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 text-left sm:text-center">
          <div className="flex items-center justify-between sm:justify-center gap-2">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Liabilitas + Aset Neto
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-center gap-2 mt-0.5 text-xs text-slate-700 font-mono">
            <span title="Total Liabilitas">{formatRupiah(totalLiabilities)}</span>
            <span className="text-slate-400 font-bold">+</span>
            <span title="Total Aset Neto">{formatRupiah(totalNetAssets)}</span>
          </div>
        </div>
      </div>

      {/* Explanatory Message */}
      <div className="mt-3.5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 border border-slate-100">
        {isBalanced ? (
          <p>
            <strong className="text-slate-800">Status Valid:</strong> Seluruh pencatatan keuangan berada dalam kondisi seimbang. Nilai aset yayasan persis sama dengan jumlah kewajiban dan aset bersih yang dilaporkan.
          </p>
        ) : (
          <p className="text-red-700">
            <strong className="text-red-800">Perhatian:</strong> Terdapat selisih antara nilai aset dengan kewajiban dan aset neto. Silakan periksa akun atau jurnal yang belum diposting melalui Neraca Saldo atau menu Rekonsiliasi.
          </p>
        )}
      </div>
    </div>
  );
};

export default BalanceSheetVerification;
