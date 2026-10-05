import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faLock } from "@fortawesome/free-solid-svg-icons";

interface AccountingPeriodsHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const AccountingPeriodsHeader: React.FC<AccountingPeriodsHeaderProps> = ({
  refreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-poppins">
            Periode Akuntansi
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brandBlueTeal-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
            <FontAwesomeIcon icon={faLock} className="text-[10px]" />
            <span>Kontrol Tutup Buku</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Pantau periode pembukuan, status buka/tutup buku, dan riwayat penutupan periode keuangan.
          Periode yang telah ditutup tidak menerima mutasi melalui alur pembukuan normal dan mengikuti kontrol tutup buku yang berlaku.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:self-center">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Segarkan Data Periode Akuntansi"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshing ? "animate-spin text-primary-500" : "text-slate-600"}
          />
          <span>{refreshing ? "Menyegarkan..." : "Segarkan"}</span>
        </button>
      </div>
    </div>
  );
};
