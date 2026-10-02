import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faReceipt,
  faCalendarAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";

interface AccountMetadataProps {
  account: Account;
}

export const AccountMetadata: React.FC<AccountMetadataProps> = ({ account }) => {
  const journalCount = account.journal_entry_lines_count ?? 0;
  const hasTransactions = journalCount > 0;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <FontAwesomeIcon icon={faShieldAlt} className="text-brandBlueTeal-500 text-sm" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Integritas & Audit Pembukuan
        </h3>
      </div>

      <div className="space-y-4">
        {/* Journal Entries Count Metric */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600">
              <FontAwesomeIcon icon={faReceipt} className="text-xs" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Transaksi Jurnal
              </div>
              <div className="text-xs text-slate-600">
                Baris entri pembukuan terkait
              </div>
            </div>
          </div>
          <span className="font-mono font-bold text-sm text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
            {journalCount}
          </span>
        </div>

        {/* Protection Warning if Transactions Exist */}
        {hasTransactions && (
          <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <FontAwesomeIcon icon={faInfoCircle} className="text-amber-600 text-xs" />
              <span>Akun Terproteksi Audit</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Akun ini telah memiliki transaksi jurnal. Penghapusan, perubahan jenis akun, dan saldo normal diproteksi demi menjaga integritas pembukuan yayasan.
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-[10px]" />
              <span>Dibuat</span>
            </div>
            <div className="font-medium text-slate-800 text-xs">
              {formatDate(account.created_at)}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-[10px]" />
              <span>Diperbarui</span>
            </div>
            <div className="font-medium text-slate-800 text-xs">
              {formatDate(account.updated_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountMetadata;
