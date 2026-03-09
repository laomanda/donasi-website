import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { ArticleStatus } from "../../../../types/article";

type EditorArticleFiltersProps = {
  q: string;
  setQ: (val: string) => void;
  status: ArticleStatus;
  setStatus: (val: ArticleStatus) => void;
  category: string;
  setCategory: (val: string) => void;
  availableCategories: Array<{ category: string; category_en: string | null }>;
  perPage: number;
  setPerPage: (val: number) => void;
  onReset: () => void;
  hasFilters: boolean;
  pageLabel: string;
};

export default function EditorArticleFilters({
  q,
  setQ,
  status,
  setStatus,
  category,
  setCategory,
  availableCategories,
  perPage,
  setPerPage,
  onReset,
  hasFilters,
  pageLabel,
}: EditorArticleFiltersProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cari</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul atau ringkasan..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value="">Semua status</option>
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kategori</span>
            <input
              list="filter-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Cari atau pilih kategori..."
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            />
            <datalist id="filter-categories">
            {availableCategories.map((cat) => (
                <option key={cat.category} value={cat.category} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faFilter} />
            </span>
            <span>Per halaman</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Atur ulang
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
        <p className="text-xs font-semibold text-slate-500">Klik judul untuk edit.</p>
      </div>
    </div>
  );
}
