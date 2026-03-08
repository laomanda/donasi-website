import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface AdminDonationFiltersProps {
  q: string;
  setQ: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  paymentSource: string;
  setPaymentSource: (val: string) => void;
  programId: string;
  setProgramId: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  programOptions: { id: number; title: string }[];
  programLoading: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function AdminDonationFilters({
  q,
  setQ,
  status,
  setStatus,
  paymentSource,
  setPaymentSource,
  programId,
  setProgramId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  programOptions,
  programLoading,
  hasFilters,
  onResetFilters,
}: AdminDonationFiltersProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-heading text-lg font-bold text-slate-800">
          <FontAwesomeIcon icon={faFilter} className="mr-2 text-emerald-500" />
          Filter & Pencarian
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
            <div className="relative mt-2 group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Kode / Donatur..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</span>
            <div className="relative mt-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="paid">Lunas</option>
                <option value="failed">Gagal</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sumber</span>
            <div className="relative mt-2">
              <select
                value={paymentSource}
                onChange={(e) => setPaymentSource(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Sumber</option>
                <option value="midtrans">Midtrans (Otomatis)</option>
                <option value="manual">Manual (Transfer)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Program</span>
            <div className="relative mt-2">
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                disabled={programLoading}
              >
                <option value="">{programLoading ? "Memuat..." : "Semua Program"}</option>
                {programOptions.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dari Tanggal</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sampai Tanggal</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex-1 rounded-xl bg-rose-50 px-6 py-3 text-sm font-bold text-rose-600 shadow-sm ring-1 ring-inset ring-rose-100 transition hover:bg-rose-100"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDonationFilters;
