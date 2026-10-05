import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

interface ReconciliationHeaderProps {
  runningReconciliation: boolean;
  onRunReconciliation: () => void;
}

export const ReconciliationHeader: React.FC<ReconciliationHeaderProps> = ({
  runningReconciliation,
  onRunReconciliation,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-poppins">
            Rekonsiliasi Keuangan
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brandBlueTeal-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
            <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
            <span>Audit Integritas</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Periksa konsistensi jurnal, periode, transaksi operasional, buku besar, neraca saldo, dan laporan keuangan.
        </p>
      </div>

      {/* Explicit Run Action */}
      <div className="flex items-center gap-2 sm:self-center">
        <button
          type="button"
          onClick={onRunReconciliation}
          disabled={runningReconciliation}
          title="Jalankan pemeriksaan rekonsiliasi dan verifikasi audit"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={runningReconciliation ? "animate-spin text-xs" : "text-xs"}
          />
          <span>{runningReconciliation ? "Memeriksa..." : "Jalankan Rekonsiliasi"}</span>
        </button>
      </div>
    </div>
  );
};
