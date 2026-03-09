import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faFlag,
  faLayerGroup,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { EditorTaskStatus, EditorTaskPriority } from "@/utils/management/adminTaskUtils";

interface EditorUserOption {
  id: number;
  name?: string | null;
  email?: string | null;
}

interface AdminTaskFiltersProps {
  q: string;
  setQ: (val: string) => void;
  status: EditorTaskStatus;
  setStatus: (val: EditorTaskStatus) => void;
  priority: EditorTaskPriority;
  setPriority: (val: EditorTaskPriority) => void;
  assignedTo: string;
  setAssignedTo: (val: string) => void;
  perPage: number;
  setPerPage: (val: number) => void;
  total: number;
  loading: boolean;
  editors: EditorUserOption[];
  onReset: () => void;
}

export default function AdminTaskFilters({
  q,
  setQ,
  status,
  setStatus,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  perPage,
  setPerPage,
  total,
  loading,
  editors,
  onReset,
}: AdminTaskFiltersProps) {
  const hasFilters = Boolean(q.trim() || status || priority || assignedTo);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FontAwesomeIcon icon={faFilter} />
          </div>
          Filter & Pencarian
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Pencarian</span>
            <div className="relative group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Status</span>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EditorTaskStatus)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Status</option>
                <option value="open">Baru</option>
                <option value="in_progress">Dikerjakan</option>
                <option value="done">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Prioritas</span>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EditorTaskPriority)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Prioritas</option>
                <option value="low">Rendah</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2 items-end">
          <div className="space-y-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Editor Terpilih</span>
            <div className="relative">
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Editor</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name ?? editor.email ?? `Editor ${editor.id}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faUserCircle} className="text-[10px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Per Halaman</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          <div className="flex items-center justify-end pb-1 gap-3">
             {loading ? (
              <div className="h-4 w-24 animate-pulse bg-slate-100 rounded" />
            ) : total > 0 ? (
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-2 rounded-lg">
                Total: {total} Tugas
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
