import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  total: number;
  onCreate: () => void;
  loading?: boolean;
};

export default function EditorBannersHeader({ total, onCreate, loading }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
            Konten
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Banner</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kelola slideshow banner yang tampil di bagian atas beranda.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
              Total: <span className="ml-1 font-bold text-slate-900">{total}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Banner
        </button>
      </div>
    </div>
  );
}
