import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import { resolveGalleryDpfUrl, type GalleryDpfFormState } from "../GalleryDpfTypes";

type Props = {
  form: GalleryDpfFormState;
  previewUrl: string | null;
  uploading: boolean;
  uploadError: string | null;
  disabled: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

export default function EditorGalleryDpfFormMain({
  form,
  previewUrl,
  uploading,
  uploadError,
  disabled,
  onUpload,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrl = previewUrl ?? resolveGalleryDpfUrl(form.image);

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Gambar aktivitas <span className="text-red-500">*</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Gunakan JPG, PNG, atau WebP.</p>
            <p className="mt-1 text-xs text-slate-500">Ukuran maksimum 10 MB.</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <FontAwesomeIcon icon={faImage} />
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Pilih Gambar
          </button>
          {form.image && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
              Hapus
            </button>
          )}
          {uploading ? (
            <span className="text-xs font-bold text-brandGreen-600 animate-pulse">Mengunggah...</span>
          ) : form.image ? (
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandGreen-700 ring-1 ring-brandGreen-100">
              Tersimpan
            </span>
          ) : null}
        </div>

        <div className="relative mt-6 group">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
            <img
              src={imageUrl}
              alt="Preview aktivitas DPF"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              onError={(event) => { event.currentTarget.src = imagePlaceholder; }}
            />
          </div>
          {!form.image && !previewUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <FontAwesomeIcon icon={faImage} className="mb-2 text-4xl opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">Belum ada gambar</p>
            </div>
          )}
        </div>

        {uploadError && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">{uploadError}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </div>
    </div>
  );
}
