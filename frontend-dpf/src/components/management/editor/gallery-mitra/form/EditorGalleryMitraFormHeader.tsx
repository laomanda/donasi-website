import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type Props = {
  mode: "create" | "edit";
  saving: boolean;
  uploading: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

export default function EditorGalleryMitraFormHeader({
  mode,
  saving,
  uploading,
  canSubmit,
  onSubmit,
  onBack,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
            {mode === "create" ? "Tambah Aktivitas" : "Ubah Aktivitas"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Dokumentasikan aktivitas mitra dengan gambar dan caption singkat dalam dua bahasa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || saving}
            className="rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brandGreen-700 disabled:opacity-70"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
