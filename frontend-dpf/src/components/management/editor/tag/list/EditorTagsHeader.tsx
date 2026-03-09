import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  total: number;
  onCreate: () => void;
};

export default function EditorTagsHeader({ total, onCreate }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
            Footer
          </span>
          <h2 className="mt-2 truncate font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Tags</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Kelola daftar tag populer yang muncul di footer website.
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 sm:w-auto md:px-5 md:py-3"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Tag
        </button>
      </div>
    </div>
  );
}
