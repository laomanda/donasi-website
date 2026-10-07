import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  total: number;
  publishedCount?: number;
  draftCount?: number;
  onCreate: () => void;
  loading?: boolean;
};

export default function EditorBannersHeader({
  total,
  publishedCount = 0,
  draftCount = 0,
  onCreate,
  loading,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Banner</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kelola slideshow banner yang tampil di bagian atas beranda website.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-white shadow-xs">
              Total: <span className="ml-1 text-white">{total}</span>
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
              Dipublikasikan: <span className="ml-1 text-white">{publishedCount}</span>
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
              Draf: <span className="ml-1 text-white">{draftCount}</span>
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
