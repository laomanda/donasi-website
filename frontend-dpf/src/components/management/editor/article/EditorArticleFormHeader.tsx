import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEye } from "@fortawesome/free-solid-svg-icons";

type EditorArticleFormHeaderProps = {
  title: string;
  mode: "create" | "edit";
  onBack: () => void;
  onPreview: () => void;
  onSubmit: () => void;
  saving: boolean;
  canSubmit: boolean;
  loading: boolean;
  deleting: boolean;
  publicUrl?: string | null;
  status?: string;
};

export default function EditorArticleFormHeader({
  title,
  mode,
  onBack,
  onPreview,
  onSubmit,
  saving,
  canSubmit,
  loading,
  deleting,
  publicUrl,
  status,
}: EditorArticleFormHeaderProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
            Artikel
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {mode === "create"
              ? "Buat draf baru, ajukan peninjauan, atau terbitkan langsung."
              : "Perbarui konten artikel agar tetap rapi dan konsisten."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            disabled={saving || deleting}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>

          {mode === "edit" && publicUrl && status === "published" && (
            <button
              type="button"
              onClick={() => window.open(publicUrl, "_blank")}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-300"
            >
              <FontAwesomeIcon icon={faEye} />
              Lihat Publik
            </button>
          )}

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-600 bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || saving || deleting}
          >
            <FontAwesomeIcon icon={faEye} />
            Pratinjau
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-1"
            disabled={!canSubmit}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
