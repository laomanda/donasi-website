import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faImages } from "@fortawesome/free-solid-svg-icons";

type Props = {
  total: number;
  loading: boolean;
  onCreate: () => void;
};

export default function EditorGalleryMitraHeader({ total, loading, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brandGreen-50 text-brandGreen-700">
            <FontAwesomeIcon icon={faImages} className="text-xs" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-600">
            Konten Publik
          </p>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
          Galeri Aktivitas Mitra
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola dokumentasi foto dan aktivitas mitra binaan DPF.
        </p>
        {!loading && (
          <p className="mt-3 text-xs font-bold text-slate-400">
            Total {total} dokumentasi
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 active:scale-95"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Tambah Aktivitas</span>
      </button>
    </div>
  );
}
