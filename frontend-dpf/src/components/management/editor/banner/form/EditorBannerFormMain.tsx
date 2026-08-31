import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { type BannerFormState, resolveBannerUrl } from "../EditorBannerTypes";

type Props = {
  form: BannerFormState;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  uploadError: string | null;
  previewUrl: string | null;
  disabled: boolean;
};

export default function EditorBannerFormMain({
  form,
  onUpload,
  onRemove,
  uploading,
  uploadError,
  previewUrl,
  disabled,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImageUrl = previewUrl ?? resolveBannerUrl(form.image_path) ?? null;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Gambar Banner</h2>
          <p className="mt-1 text-sm text-slate-500">
            Unggah gambar banner untuk slideshow di beranda utama website.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center justify-center rounded-xl bg-brandGreen-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:opacity-50"
        >
          {activeImageUrl ? "Ganti Gambar" : "Pilih Gambar"}
        </button>

        {activeImageUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
            Hapus
          </button>
        )}

        {uploading && (
          <span className="text-xs font-semibold text-brandGreen-600">Mengunggah gambar...</span>
        )}
      </div>

      {uploadError && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
          {uploadError}
        </p>
      )}

      {/* Preview / Upload Container */}
      <div className="mt-6">
        {activeImageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 aspect-[21/9] sm:aspect-[24/10]">
            <img
              src={activeImageUrl}
              alt="Preview Banner"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition hover:border-slate-300 hover:bg-slate-50 aspect-[21/9] sm:aspect-[24/10] flex flex-col items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              Klik untuk memilih gambar banner
            </p>
            <p className="text-xs text-slate-400">
              Format JPG, PNG, atau WEBP (Maksimal 6MB)
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
        disabled={disabled || uploading}
      />
    </div>
  );
}
