import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faFileInvoiceDollar,
  faScaleBalanced,
  faCheckCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";

interface BalanceSheetSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  currentPeriodSurplus?: number;
  isBalanced: boolean;
  assetCount: number;
  liabilityCount: number;
  netAssetCount: number;
}

export const BalanceSheetSummary: React.FC<BalanceSheetSummaryProps> = ({
  totalAssets,
  totalLiabilities,
  totalNetAssets,
  currentPeriodSurplus,
  isBalanced,
  assetCount,
  liabilityCount,
  netAssetCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
      {/* 1. Total Aset */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 border-t-brandBlueTeal-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL ASET
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-brandBlueTeal-500">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
          </div>
        </div>
        <div>
          <p
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
            title={formatRupiah(totalAssets)}
          >
            {formatRupiah(totalAssets)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {assetCount} akun aset aktif
          </p>
        </div>
      </div>

      {/* 2. Total Liabilitas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 border-t-brandWarmOrange-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL LIABILITAS
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-brandWarmOrange-500">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
          </div>
        </div>
        <div>
          <p
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
            title={formatRupiah(totalLiabilities)}
          >
            {formatRupiah(totalLiabilities)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {liabilityCount} akun kewajiban
          </p>
        </div>
      </div>

      {/* 3. Total Aset Neto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 border-t-brandPurple-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL ASET NETO
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-brandPurple-500">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-xs" />
          </div>
        </div>
        <div>
          <p
            className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
            title={formatRupiah(totalNetAssets)}
          >
            {formatRupiah(totalNetAssets)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            {currentPeriodSurplus !== undefined && currentPeriodSurplus !== 0
              ? `Termasuk surplus berjalan ${formatRupiah(currentPeriodSurplus)}`
              : `${netAssetCount} posisi ekuitas wakaf`}
          </p>
        </div>
      </div>

      {/* 4. Status Neraca */}
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs border-t-4 space-y-2 ${
          isBalanced ? "border-t-brandGreen-500" : "border-t-rose-600"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            STATUS NERACA
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
              isBalanced ? "bg-brandGreen-500" : "bg-rose-600"
            }`}
          >
            <FontAwesomeIcon
              icon={isBalanced ? faCheckCircle : faTriangleExclamation}
              className="text-xs"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-lg sm:text-xl font-bold ${
                isBalanced ? "text-brandGreen-600" : "text-rose-600"
              }`}
            >
              {isBalanced ? "SEIMBANG" : "TIDAK SEIMBANG"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {isBalanced
              ? "Persamaan akuntansi terpenuhi"
              : "Periksa transaksi jurnal dan rekonsiliasi"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetSummary;
