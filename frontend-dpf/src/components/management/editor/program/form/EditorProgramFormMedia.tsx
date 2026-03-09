import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { type ProgramFormState } from "../EditorProgramTypes";
import { resolveStorageUrl } from "../EditorProgramUtils";
import { FormLabel } from "../EditorProgramUI";

type Props = {
    form: ProgramFormState;
    onChange: (updates: Partial<ProgramFormState>) => void;
    onUploadThumbnail: (file: File) => void;
    onUploadBanner: (file: File) => void;
    onUploadGallery: (index: number, file: File) => void;
    onRemoveGallery: (index: number) => void;
    thumbnailUploading: boolean;
    bannerUploading: boolean;
    galleryUploading: boolean[];
    thumbnailPreviewUrl: string | null;
    bannerPreviewUrl: string | null;
    galleryPreviewUrls: (string | null)[];
    thumbnailError: string | null;
    bannerError: string | null;
    galleryErrors: string[];
    canSubmit: boolean;
};

export default function EditorProgramFormMedia({
    form,
    onUploadThumbnail,
    onUploadBanner,
    onUploadGallery,
    onRemoveGallery,
    thumbnailUploading,
    bannerUploading,
    galleryUploading,
    thumbnailPreviewUrl,
    bannerPreviewUrl,
    galleryPreviewUrls,
    thumbnailError,
    bannerError,
    galleryErrors,
    canSubmit,
}: Props) {
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const savedThumbnailUrl = resolveStorageUrl(form.thumbnail_path);
    const savedBannerUrl = resolveStorageUrl(form.banner_path);

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="font-heading text-xl font-semibold text-slate-900">Thumbnail & Banner</h2>
                        <p className="mt-1 text-sm text-slate-600">Unggah gambar utama program.</p>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Thumbnail */}
                    <div className="space-y-3">
                        <FormLabel label="Thumbnail" required subLabel="Rasio 1:1 direkomendasikan." />
                        <div className="relative group overflow-hidden rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 aspect-square flex items-center justify-center transition hover:border-brandGreen-400">
                            {(thumbnailPreviewUrl || savedThumbnailUrl) ? (
                                <img src={thumbnailPreviewUrl || savedThumbnailUrl || ""} alt="Thumbnail" className="h-full w-full object-cover" />
                            ) : (
                                <FontAwesomeIcon icon={faImage} className="text-4xl text-slate-300" />
                            )}
                            <button
                                type="button"
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold"
                            >
                                Pilih Gambar
                            </button>
                        </div>
                        {thumbnailUploading && <p className="text-xs font-semibold text-brandGreen-600">Mengunggah...</p>}
                        {thumbnailError && <p className="text-xs font-semibold text-rose-600">{thumbnailError}</p>}
                        <input
                            type="file"
                            ref={thumbnailInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUploadThumbnail(file);
                            }}
                        />
                    </div>

                    {/* Banner */}
                    <div className="space-y-3">
                        <FormLabel label="Banner" optional subLabel="Rasio 16:9 direkomendasikan." />
                        <div className="relative group overflow-hidden rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 aspect-video flex items-center justify-center transition hover:border-brandGreen-400">
                            {(bannerPreviewUrl || savedBannerUrl) ? (
                                <img src={bannerPreviewUrl || savedBannerUrl || ""} alt="Banner" className="h-full w-full object-cover" />
                            ) : (
                                <FontAwesomeIcon icon={faImage} className="text-4xl text-slate-300" />
                            )}
                            <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold"
                            >
                                Pilih Gambar
                            </button>
                        </div>
                        {bannerUploading && <p className="text-xs font-semibold text-brandGreen-600">Mengunggah...</p>}
                        {bannerError && <p className="text-xs font-semibold text-rose-600">{bannerError}</p>}
                        <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUploadBanner(file);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="font-heading text-xl font-semibold text-slate-900">Galeri Program</h2>
                        <p className="mt-1 text-sm text-slate-600">Maksimal 3 gambar untuk galeri transparansi.</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <FontAwesomeIcon icon={faImage} />
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {form.program_images.map((path, index) => {
                        const previewUrl = galleryPreviewUrls[index];
                        const savedUrl = resolveStorageUrl(path);
                        const hasImage = Boolean(previewUrl || savedUrl);
                        return (
                            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Gambar {index + 1}</p>
                                <div className="mt-3 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200 aspect-square flex items-center justify-center relative">
                                    {hasImage ? (
                                        <img src={previewUrl ?? savedUrl ?? undefined} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-200" />
                                    )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRefs.current[index]?.click()}
                                        className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
                                        disabled={!canSubmit}
                                    >
                                        Pilih
                                    </button>
                                    {hasImage && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveGallery(index)}
                                            className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
                                            disabled={!canSubmit}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                                {galleryUploading[index] && <p className="mt-2 text-xs font-semibold text-brandGreen-600">Mengunggah...</p>}
                                {galleryErrors[index] && <p className="mt-2 text-xs font-semibold text-rose-600">{galleryErrors[index]}</p>}
                                <input
                                    type="file"
                                    ref={(el) => {
                                        galleryInputRefs.current[index] = el;
                                    }}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onUploadGallery(index, file);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
