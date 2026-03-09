import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { TagFormState } from "../EditorTagTypes";

type Props = {
  form: TagFormState;
  onChange: (updates: Partial<TagFormState>) => void;
  disabled: boolean;
  mode: "create" | "edit";
  onDelete?: () => void;
  deleting?: boolean;
};

export default function EditorTagFormMain({
  form,
  onChange,
  disabled,
  mode,
  onDelete,
  deleting = false,
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Nama Tag <span className="text-red-500">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Contoh: Donasi, Wakaf, Zakat"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              URL <span className="text-slate-400">(opsional)</span>
            </span>
            <input
              value={form.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://contoh.co.id/program"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>
        </div>
      </div>

      {mode === "edit" && onDelete && (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus tag</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tag yang dihapus tidak akan tampil di footer website. Pastikan sudah benar.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faTrash} />
              Hapus Tag
            </button>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
              <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={deleting}
                >
                  {deleting ? "Menghapus..." : "Ya, hapus"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
