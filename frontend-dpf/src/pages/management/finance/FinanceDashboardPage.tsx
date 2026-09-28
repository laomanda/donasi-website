import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCoins,
  faScaleUnbalanced,
  faVault,
  faShieldHalved,
  faFileImport,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceStatCard,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";

export function FinanceDashboardPage() {
  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Pusat Keuangan & Akuntansi"
        description="Sistem pembukuan berpasangan (Double-Entry Bookkeeping), pelaporan keuangan PSAK 409 / SAS 109, dan rekonsiliasi kontrol otomatis Yayasan Wakaf Djalaludin Pane."
        badge={<FinanceStatusBadge status="active" label="Sistem Akuntansi Aktif" />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/finance/reconciliation"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600" />
              Kontrol Rekonsiliasi
            </Link>
            <Link
              to="/finance/journals"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              Jurnal Umum
            </Link>
          </div>
        }
      />

      {/* High-Level Financial KPI Foundation */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          title="Buku Besar & Jurnal"
          value="Double Entry"
          helper="Terintegrasi otomatis donasi & penyaluran"
          icon={faBookOpen}
          tone="emerald"
        />
        <FinanceStatCard
          title="Keseimbangan Neraca"
          value="Debit = Kredit"
          helper="Trial Balance & Keseimbangan Akun"
          icon={faScaleUnbalanced}
          tone="blue"
        />
        <FinanceStatCard
          title="Aset Wakaf Kelolaan"
          value="PSAK 409"
          helper="Register aset & penyusutan berkala"
          icon={faVault}
          tone="teal"
        />
        <FinanceStatCard
          title="14 Kontrol Rekonsiliasi"
          value="Siap Audit"
          helper="Pendeteksi selisih & integritas saldo"
          icon={faShieldHalved}
          tone="primary"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">
          Modul Keuangan & Akuntansi YWDP
        </h2>
        <p className="text-xs font-medium text-slate-500 mb-6">
          Akses langsung ke buku besar, laporan keuangan formal, periode pembukuan, dan manajemen data.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/finance/journals"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-800">Jurnal Umum</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Entri jurnal berpasangan, posting, void & reverse.</p>
            </div>
          </Link>

          <Link
            to="/finance/general-ledger"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-800">Buku Besar</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Rincian mutasi debet/kredit per akun COA.</p>
            </div>
          </Link>

          <Link
            to="/finance/trial-balance"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <FontAwesomeIcon icon={faScaleUnbalanced} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-800">Neraca Saldo</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Verifikasi keseimbangan saldo akun sebelum pelaporan.</p>
            </div>
          </Link>

          <Link
            to="/finance/balance-sheet"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <FontAwesomeIcon icon={faVault} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-teal-800">Laporan Posisi Keuangan</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Neraca aset, liabilitas, dan ekuitas wakaf.</p>
            </div>
          </Link>

          <Link
            to="/finance/activity-statement"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-amber-800">Laporan Aktivitas</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Pendapatan, beban program, dan surplus/defisit.</p>
            </div>
          </Link>

          <Link
            to="/finance/reconciliation"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-rose-800">Rekonsiliasi & Kontrol</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">14 titik rekonsiliasi otomatis donasi, kas, dan buku besar.</p>
            </div>
          </Link>

          <Link
            to="/finance/import"
            className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <FontAwesomeIcon icon={faFileImport} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-purple-800">Import & Export Data</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Migrasi Excel AD, JU, saldo awal, dan paket tahunan.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboardPage;
