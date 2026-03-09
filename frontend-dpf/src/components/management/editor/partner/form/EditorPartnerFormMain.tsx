import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { type PartnerFormState, resolveStorageUrl } from "../EditorPartnerTypes";

type Props = {
  form: PartnerFormState;
  onChange: (updates: Partial<PartnerFormState>) => void;
  disabled: boolean;
  mode: "create" | "edit";
  onDelete?: () => void;
  deleting?: boolean;
};

export default function EditorPartnerFormMain({
  form,
  onChange,
  disabled,
  mode,
  onDelete,
  deleting = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (form._previewUrl) {
        URL.revokeObjectURL(form._previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      onChange({ logo_path: file, _previewUrl: previewUrl });
    }
  };

  const clearFile = () => {
    if (form._previewUrl) {
      URL.revokeObjectURL(form._previewUrl);
    }
    onChange({ logo_path: null, _previewUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-heading text-lg font-bold text-slate-900">Detail Mitra</h3>
        <div className="mt-6 grid grid-cols-1 gap-6">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Nama Mitra <span className="text-red-500">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Contoh: Dompet Dhuafa, BAZNAS, Rumah Zakat"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              URL Website <span className="text-slate-400">(opsional)</span>
            </span>
            <input
              value={form.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://mitra.com"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Deskripsi <span className="text-slate-400">(opsional)</span>
            </span>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Deskripsi singkat mitra (maks. 2-3 kalimat)."
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <div className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Logo Mitra <span className="text-red-500">*</span>
            </span>
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={disabled}
              />
              {!form.logo_path && !form._previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
                    disabled
                      ? "border-slate-200 bg-slate-50 opacity-50"
                      : "border-slate-300 bg-slate-50 hover:border-brandGreen-500 hover:bg-brandGreen-50"
                  }`}
                >
                  <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="h-6 w-6 text-brandGreen-600" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-900">Klik untuk mengunggah logo</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Maks. batas file: 2MB</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center p-4 min-h-[120px]">
                  <img
                    src={form._previewUrl || resolveStorageUrl(typeof form.logo_path === "string" ? form.logo_path : null)}
                    alt="Preview"
                    className="max-h-48 max-w-full object-contain transition-all duration-300"
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Disarankan gambar dengan latar transparan (PNG).
            </p>
          </div>
        </div>
      </div>

      {mode === "edit" && onDelete && (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus mitra</h2>
          <p className="mt-2 text-sm text-slate-600">
            Mitra yang dihapus tidak akan tampil di website. Pastikan sudah benar.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faTrash} />
              Hapus Mitra
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
