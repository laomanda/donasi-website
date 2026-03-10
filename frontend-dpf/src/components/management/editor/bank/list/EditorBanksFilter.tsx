import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface EditorBanksFilterProps {
  q: string;
  setQ: (v: string) => void;
  status: "" | "active" | "inactive";
  setStatus: (v: "" | "active" | "inactive") => void;
  bankType: "" | "domestic" | "international";
  setBankType: (v: "" | "domestic" | "international") => void;
}

export function EditorBanksFilter({
  q,
  setQ,
  status,
  setStatus,
  bankType,
  setBankType,
}: EditorBanksFilterProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Pencarian</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-brandGreen-500/20 focus-within:border-brandGreen-500 transition">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari bank, nomor, atau atas nama..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Status tampil</span>
            <div className="relative mt-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brandGreen-500 focus:bg-white focus:ring-4 focus:ring-brandGreen-500/10"
              >
                <option value="">Semua Status</option>
                <option value="active">Tampil</option>
                <option value="inactive">Disembunyikan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Wilayah</span>
            <div className="relative mt-2">
              <select
                value={bankType}
                onChange={(e) => setBankType(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brandGreen-500 focus:bg-white focus:ring-4 focus:ring-brandGreen-500/10"
              >
                <option value="">Semua Wilayah</option>
                <option value="domestic">Dalam Negeri</option>
                <option value="international">Luar Negeri</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
