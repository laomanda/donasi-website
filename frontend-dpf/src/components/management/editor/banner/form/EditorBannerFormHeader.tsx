import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
  mode: "create" | "edit";
  saving: boolean;
  uploading: boolean;
  deleting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onDelete?: () => void;
};

export default function EditorBannerFormHeader({
  mode,
  saving,
  uploading,
  deleting,
  canSubmit,
  onSubmit,
  onBack,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = mode === "create" ? "Tambah Banner" : "Ubah Banner";

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
            Banner digunakan untuk slideshow di beranda. Pastikan resolusi dan urutan tampil sudah sesuai.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            disabled={saving || uploading || deleting}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>

          {mode === "edit" && onDelete && (
            !confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving || uploading || deleting}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTrash} />
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    onDelete();
                  }}
                  disabled={saving || uploading || deleting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {deleting ? "Menghapus..." : "Yakin Hapus?"}
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit || saving || deleting}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
