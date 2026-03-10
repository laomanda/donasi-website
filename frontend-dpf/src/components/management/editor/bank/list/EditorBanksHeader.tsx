import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface EditorBanksHeaderProps {
  totalItems: number;
  activeCount: number;
  onAdd: () => void;
}

export function EditorBanksHeader({ totalItems, activeCount, onAdd }: EditorBanksHeaderProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
            Keuangan
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Rekening Resmi</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kelola rekening yang tampil di halaman donasi publik.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">
              Total: <span className="text-slate-900">{totalItems}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">
              Tampil: <span className="text-slate-900">{activeCount}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Rekening
        </button>
      </div>
    </div>
  );
}
