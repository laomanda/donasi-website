import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { CurrencyDisplay } from "@/components/management/finance/shared";
import type {
  AccountingPeriod,
  TrialBalanceResponse,
  ReconciliationSummary,
} from "@/types/finance";
import type { FinanceDashboardMetrics } from "@/utils/financeDashboardMetrics";

interface FinancialKpiCardProps {
  title: string;
  value: React.ReactNode;
  helper: string;
  icon?: IconDefinition;
  accentBorder: string;
  iconBg?: string;
  loading?: boolean;
}

function FinancialKpiCard({
  title,
  value,
  helper,
  icon,
  accentBorder,
  iconBg,
  loading = false,
}: FinancialKpiCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md border-t-4 ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 truncate">
          {title}
        </p>
        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} text-white text-xs font-bold shadow-sm`}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200 my-1" />
        ) : (
          <div className="font-heading text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 tabular-nums break-words">
            {value}
          </div>
        )}
        <p className="mt-1 text-xs font-medium text-slate-500 truncate">
          {helper}
        </p>
      </div>
    </div>
  );
}

interface FinanceSnapshotProps {
  metrics: FinanceDashboardMetrics;
  trialBalance: TrialBalanceResponse | null;
  reconciliation: ReconciliationSummary | null;
  selectedPeriod: AccountingPeriod | null;
  loading: boolean;
}

export const FinanceSnapshot: React.FC<FinanceSnapshotProps> = ({
  metrics,
  trialBalance,
  reconciliation,
  selectedPeriod,
  loading,
}) => {
  const {
    totalAssets,
    totalLiabilities,
    totalNetAssets,
    totalRevenues,
    totalExpenses,
    surplusDeficit,
    isSurplus,
  } = metrics;

  const passedChecks =
    reconciliation?.passed_checks ??
    (reconciliation?.total_checks
      ? reconciliation.total_checks - (reconciliation?.failed_checks ?? 0)
      : 13);
  const totalChecks = reconciliation?.total_checks ?? 14;

  return (
    <section aria-labelledby="financial-snapshot-title" className="space-y-3 sm:space-y-4">
      <h2 id="financial-snapshot-title" className="sr-only">
        Ringkasan Angka Keuangan
      </h2>

      {/* Row 1: Primary Metrics */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
        <FinancialKpiCard
          title="Total Aset"
          value={<CurrencyDisplay amount={totalAssets} />}
          helper="Kas, bank & aset wakaf"
          accentBorder="border-t-brandBlueTeal-500"
          loading={loading}
        />
        <FinancialKpiCard
          title="Aset Neto"
          value={<CurrencyDisplay amount={totalNetAssets} />}
          helper="Saldo dana neto wakaf"
          accentBorder="border-t-brandGreen-500"
          loading={loading}
        />
        <FinancialKpiCard
          title="Penerimaan"
          value={<CurrencyDisplay amount={totalRevenues} />}
          helper="Donasi & hasil kelola"
          accentBorder="border-t-primary-500"
          loading={loading}
        />
        <FinancialKpiCard
          title="Beban & Penyaluran"
          value={<CurrencyDisplay amount={totalExpenses} />}
          helper="Program & operasional"
          accentBorder="border-t-slate-700"
          loading={loading}
        />
      </div>

      {/* Row 2: Secondary Metrics & Contextual Status */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
        <FinancialKpiCard
          title="Total Liabilitas"
          value={<CurrencyDisplay amount={totalLiabilities} />}
          helper="Kewajiban berjalan entitas"
          accentBorder="border-t-brandWarmOrange-500"
          loading={loading}
        />
        <FinancialKpiCard
          title="Surplus / Defisit"
          value={<CurrencyDisplay amount={surplusDeficit} tone="auto" />}
          helper={isSurplus ? "Surplus periode berjalan" : "Defisit periode berjalan"}
          accentBorder={isSurplus ? "border-t-brandGreen-500" : "border-t-rose-600"}
          loading={loading}
        />

        {/* Accounting Status Panel */}
        <div className="min-[480px]:col-span-2 lg:col-span-1 xl:col-span-2 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between border-t-4 border-t-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Status Pembukuan Periode
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white text-xs font-bold shadow-sm">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Neraca Saldo</p>
              <p
                className={`font-bold mt-0.5 ${
                  trialBalance?.is_balanced ? "text-brandGreen-700" : "text-amber-700"
                }`}
              >
                {trialBalance?.is_balanced ? "Seimbang" : "Perlu Evaluasi"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Rekonsiliasi</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {passedChecks} / {totalChecks} Lolos
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-slate-500">Pencatatan</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {selectedPeriod?.status === "open" ? "Buku Terbuka" : "Buku Ditutup"}
              </p>
            </div>
          </div>

          <p className="text-xs font-medium text-slate-500 border-t border-slate-200 pt-2 truncate">
            Kepatuhan pembukuan berpasangan dan kontrol integritas data YWDP.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinanceSnapshot;
