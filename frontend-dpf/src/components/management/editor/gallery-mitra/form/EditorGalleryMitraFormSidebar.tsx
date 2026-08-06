import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { type GalleryMitraFormState, type GalleryMitraStatus } from "../GalleryMitraTypes";

type Props = {
  form: GalleryMitraFormState;
  disabled: boolean;
  onChange: (field: keyof GalleryMitraFormState, value: string) => void;
  mode?: "create" | "edit";
  onDelete?: () => void;
  deleting?: boolean;
};

const fields = [
  { key: "caption_id" as const, label: "Caption Indonesia", placeholder: "Contoh: Program Mitra" },
  { key: "caption_en" as const, label: "Caption English", placeholder: "Example: Partner Program" },
];

const limitWordLength = (text: string, maxWordLen = 25): string => {
  if (!text) return "";
  const parts = text.split(/(\s+)/u);
  return parts
    .map((part) => (/\s+/u.test(part) ? part : part.slice(0, maxWordLen)))
    .join("");
};

const hasWordAtMax = (text: string, maxWordLen = 25): boolean => {
  if (!text.trim()) return false;
  const words = text.trim().split(/\s+/u);
  return words.some((w) => w.length >= maxWordLen);
};

export default function EditorGalleryMitraFormSidebar({
  form,
  disabled,
  onChange,
  mode,
  onDelete,
  deleting = false,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (field: keyof GalleryMitraFormState, rawValue: string) => {
    const sanitized = limitWordLength(rawValue, 25);
    onChange(field, sanitized);
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>
        <div className="mt-5 space-y-5">
          {fields.map((field) => {
            const value = form[field.key] ?? "";
            const wordAtMax = hasWordAtMax(value, 25);

            return (
              <label key={field.key} className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {field.label} <span className="text-red-500">*</span>
                </span>
                <input
                  value={value}
                  onChange={(event) => handleInputChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  maxLength={250}
                  disabled={disabled || deleting}
                  className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-4 disabled:opacity-60 ${
                    wordAtMax
                      ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100"
                      : "border-slate-200 focus:border-brandGreen-400 focus:ring-brandGreen-50"
                  }`}
                />
                {wordAtMax ? (
                  <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-amber-600">
                    <span>⚠️ 1 kata mencapai batas 25 karakter! Tekan spasi untuk kata baru.</span>
                    <span>{value.length}/250</span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-slate-400">
                    <span>Maks. 250 karakter (maks. 25 karakter/kata)</span>
                    <span>{value.length}/250</span>
                  </div>
                )}
              </label>
            );
          })}

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Status <span className="text-red-500">*</span>
            </span>
            <select
              value={form.status}
              onChange={(event) => onChange("status", event.target.value as GalleryMitraStatus)}
              disabled={disabled || deleting}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50 disabled:opacity-60"
            >
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
              <option value="archived">Arsip</option>
            </select>
          </label>
        </div>
      </div>

      {mode === "edit" && onDelete && (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Zona berbahaya</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus Aktivitas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Menghapus aktivitas akan menghilangkan konten dari sistem. Tindakan ini tidak bisa dibatalkan.
          </p>

          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={disabled || deleting}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTrash} />
              Hapus Aktivitas
            </button>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
              <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
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
