import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type Props = {
  mode: "create" | "edit";
  saving: boolean;
  deleting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

export default function EditorPartnerFormHeader({
  mode,
  saving,
  deleting,
  canSubmit,
  onSubmit,
  onBack,
}: Props) {
  const title = mode === "create" ? "Tambah Mitra" : "Ubah Mitra";

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
            Branding
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {mode === "create"
              ? "Tambahkan logo, nama, dan detail mitra baru."
              : "Perbarui detail mitra agar selalu relevan."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            disabled={saving || deleting}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit || saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
