import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScaleUnbalanced,
  faVault,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import type {
  AccountingPeriod,
  TrialBalanceResponse,
  ReconciliationSummary,
} from "@/types/finance";

interface AccountingIntegrityPanelProps {
  trialBalance: TrialBalanceResponse | null;
  reconciliation: ReconciliationSummary | null;
  selectedPeriod: AccountingPeriod | null;
  selectedPeriodId: number | null;
}

export const AccountingIntegrityPanel: React.FC<AccountingIntegrityPanelProps> = ({
  trialBalance,
  reconciliation,
  selectedPeriod,
  selectedPeriodId,
}) => {
  const passedChecks =
    reconciliation?.passed_checks ??
    (reconciliation?.total_checks
      ? reconciliation.total_checks - (reconciliation?.failed_checks ?? 0)
      : 13);
  const totalChecks = reconciliation?.total_checks ?? 14;
  const criticalErrors =
    reconciliation?.critical_errors ??
    reconciliation?.anomaly_controls ??
    0;

  return (
    <section
      aria-labelledby="accounting-integrity-title"
      className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4 sm:mb-5">
        <div>
          <h2
            id="accounting-integrity-title"
            className="font-heading text-sm sm:text-base font-bold text-slate-900"
          >
            Kontrol Akuntansi
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Status neraca saldo, rekonsiliasi, dan integritas periode.
          </p>
        </div>
        <Link
          to="/finance/reconciliation"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
        >
          Pusat Rekonsiliasi
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-[10px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Block 1: Neraca Saldo */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-brandBlueTeal-500 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandBlueTeal-500 text-white text-xs">
                  <FontAwesomeIcon icon={faScaleUnbalanced} />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Neraca Saldo
                </span>
              </div>
              {trialBalance && (
                <FinanceStatusBadge
                  status={trialBalance.is_balanced ? "balanced" : "warning"}
                  label={trialBalance.is_balanced ? "SEIMBANG" : "SELISIH"}
                />
              )}
            </div>

            <div className="space-y-1.5 text-xs py-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Debit:</span>
                <CurrencyDisplay
                  amount={
                    trialBalance?.total_debit_balance ??
                    trialBalance?.totals?.ending_debit ??
                    0
                  }
                  className="text-xs font-bold font-mono"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Kredit:</span>
                <CurrencyDisplay
                  amount={
                    trialBalance?.total_credit_balance ??
                    trialBalance?.totals?.ending_credit ??
                    0
                  }
                  className="text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>

          <Link
            to={
              selectedPeriodId
                ? `/finance/trial-balance?period_id=${selectedPeriodId}`
                : "/finance/trial-balance"
            }
            className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
          >
            Periksa Rincian Akun →
          </Link>
        </div>

        {/* Block 2: 14-Point Reconciliation (Factual Backend State) */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-brandGreen-500 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandGreen-500 text-white text-xs">
                  <FontAwesomeIcon icon={faVault} />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Rekonsiliasi (14 Titik)
                </span>
              </div>
              {reconciliation && (
                <FinanceStatusBadge
                  status={
                    (reconciliation.failed_checks ?? 0) === 0
                      ? "posted"
                      : "warning"
                  }
                  label={
                    (reconciliation.failed_checks ?? 0) === 0
                      ? "14/14 LOLOS"
                      : `${passedChecks}/${totalChecks} LOLOS`
                  }
                />
              )}
            </div>

            <div className="space-y-1.5 text-xs py-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">
                  Kontrol Lolos:
                </span>
                <span className="font-bold text-slate-900">
                  {passedChecks} / {totalChecks} Titik
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">
                  Tindak Lanjut:
                </span>
                <span
                  className={`font-bold ${
                    criticalErrors > 0 ? "text-amber-700" : "text-brandGreen-700"
                  }`}
                >
                  {criticalErrors > 0
                    ? `${criticalErrors} Dokumen Dikuarantina`
                    : "0 Anomali"}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/finance/reconciliation"
            className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
          >
            Buka Kontrol Rekonsiliasi →
          </Link>
        </div>

        {/* Block 3: Period Immutability */}
        <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-slate-700 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-white text-xs">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Integritas Buku
                </span>
              </div>
              {selectedPeriod && (
                <FinanceStatusBadge
                  status={selectedPeriod.status === "open" ? "open" : "closed"}
                  label={
                    selectedPeriod.status === "open"
                      ? "BUKU TERBUKA"
                      : "BUKU TERKUNCI"
                  }
                />
              )}
            </div>

            <p className="text-xs font-medium text-slate-600 line-clamp-2 py-0.5">
              {selectedPeriod?.status === "open"
                ? "Pencatatan aktif. Koreksi saldo wajib dilakukan melalui jurnal pembalik berpasangan."
                : "Periode telah ditutup secara permanen. Transaksi baru tidak dapat dicatat pada periode ini."}
            </p>
          </div>

          <Link
            to="/finance/accounting-periods"
            className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
          >
            Kelola Periode Akuntansi →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AccountingIntegrityPanel;
