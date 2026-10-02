import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import { AccountLedgerHeader } from "./AccountLedgerHeader";
import { AccountLedgerSummary } from "./AccountLedgerSummary";
import { AccountLedgerTable } from "./AccountLedgerTable";
import { AccountLedgerMobileList } from "./AccountLedgerMobileList";
import type { GeneralLedgerAccount } from "@/types/finance";

interface AccountLedgerViewProps {
  account: GeneralLedgerAccount;
  periodName?: string | null;
  startDate?: string | null;
  onBackToOverview: () => void;
}

export const AccountLedgerView: React.FC<AccountLedgerViewProps> = ({
  account,
  periodName,
  startDate,
  onBackToOverview,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Account Identity & Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <AccountLedgerHeader
          account={account}
          periodName={periodName}
          onBackToOverview={onBackToOverview}
        />
        <AccountLedgerSummary account={account} />
      </div>

      {/* 2. Transactions Ledger Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50/80">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Riwayat Mutasi & Saldo Berjalan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Menampilkan {account.transactions.length} mutasi jurnal yang mempengaruhi saldo akun perkiraan ini.
            </p>
          </div>
          <div className="text-xs text-slate-600">
            Saldo Akhir: <strong className="font-mono text-slate-900 font-bold">{formatRupiah(account.closing_balance)}</strong>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <AccountLedgerTable account={account} startDate={startDate} onBackToOverview={onBackToOverview} />
        </div>

        {/* Mobile List View */}
        <div className="block md:hidden">
          <AccountLedgerMobileList account={account} startDate={startDate} />
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerView;
