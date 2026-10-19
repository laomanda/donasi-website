import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo, faTrash, faFilm } from "@fortawesome/free-solid-svg-icons";
import { type BannerFormState, type BannerMediaType, resolveBannerUrl } from "../EditorBannerTypes";

type Props = {
  form: BannerFormState;
  onMediaTypeChange: (type: BannerMediaType) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
  imageUploading: boolean;
  imageError: string | null;
  imagePreviewUrl: string | null;
  onUploadVideo: (file: File) => void;
  onRemoveVideo: () => void;
  videoUploading: boolean;
  videoError: string | null;
  videoPreviewUrl: string | null;
  onVideoDurationDetected?: (duration: number) => void;
  disabled: boolean;
};

export default function EditorBannerFormMain({
  form,
  onMediaTypeChange,
  onUploadImage,
  onRemoveImage,
  imageUploading,
  imageError,
  imagePreviewUrl,
  onUploadVideo,
  onRemoveVideo,
  videoUploading,
  videoError,
  videoPreviewUrl,
  onVideoDurationDetected,
  disabled,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const activeImageUrl = imagePreviewUrl ?? resolveBannerUrl(form.image_path) ?? null;
  const activeVideoUrl = videoPreviewUrl ?? resolveBannerUrl(form.video_path) ?? null;

  const isVideo = form.media_type === "video";

  return (
    <div className="space-y-6">
      {/* Media Type Switcher */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tipe Media Banner</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih format banner yang ingin ditampilkan di slider beranda: gambar statis atau video dinamis.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onMediaTypeChange("image")}
            disabled={disabled || imageUploading || videoUploading}
            className={[
              "flex items-center justify-center gap-2.5 rounded-2xl border p-4 font-semibold text-sm transition shadow-xs",
              !isVideo
                ? "border-brandGreen-600 bg-brandGreen-50/70 text-brandGreen-950 ring-2 ring-brandGreen-500/20"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <FontAwesomeIcon icon={faImage} className={!isVideo ? "text-brandGreen-600 text-base" : "text-slate-400 text-base"} />
            <span>Gambar / Foto</span>
          </button>

          <button
            type="button"
            onClick={() => onMediaTypeChange("video")}
            disabled={disabled || imageUploading || videoUploading}
            className={[
              "flex items-center justify-center gap-2.5 rounded-2xl border p-4 font-semibold text-sm transition shadow-xs",
              isVideo
                ? "border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <FontAwesomeIcon icon={faVideo} className={isVideo ? "text-purple-600 text-base" : "text-slate-400 text-base"} />
            <span>Video Banner</span>
          </button>
        </div>
      </div>

      {/* Main Media Upload Card */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!isVideo ? (
          /* ================= IMAGE BANNER ================= */
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Gambar Banner</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Unggah berkas foto/gambar untuk slideshow beranda utama website.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled || imageUploading}
                className="inline-flex items-center justify-center rounded-xl bg-brandGreen-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:opacity-50"
              >
                {activeImageUrl ? "Ganti Gambar" : "Pilih Gambar"}
              </button>

              {activeImageUrl && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  disabled={disabled || imageUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Hapus
                </button>
              )}

              {imageUploading && (
                <span className="text-xs font-semibold text-brandGreen-600 animate-pulse">
                  Mengunggah gambar...
                </span>
              )}
            </div>

            {imageError && (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                {imageError}
              </p>
            )}

            <div className="mt-6">
              {activeImageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center">
                  <img
                    src={activeImageUrl}
                    alt="Preview Banner"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition hover:border-slate-300 hover:bg-slate-50 aspect-video flex flex-col items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    Klik untuk memilih gambar banner
                  </p>
                  <p className="text-xs text-slate-400">
                    Format JPG, PNG, atau WEBP (Maksimal 6MB, Rekomendasi 1920x1080)
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= VIDEO BANNER ================= */
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Berkas Video Banner</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Unggah berkas video untuk diputar otomatis di latar slider beranda website.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={disabled || videoUploading}
                className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
              >
                {activeVideoUrl ? "Ganti Video" : "Pilih Berkas Video"}
              </button>

              {activeVideoUrl && (
                <button
                  type="button"
                  onClick={onRemoveVideo}
                  disabled={disabled || videoUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Hapus Video
                </button>
              )}

              {videoUploading && (
                <span className="text-xs font-semibold text-purple-600 animate-pulse">
                  Mengunggah video...
                </span>
              )}
            </div>

            {videoError && (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                {videoError}
              </p>
            )}

            <div className="mt-6">
              {activeVideoUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black aspect-video relative flex items-center justify-center">
                  <video
                    src={activeVideoUrl}
                    controls
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const dur = Math.round(e.currentTarget.duration);
                      if (dur > 0 && onVideoDurationDetected) {
                        onVideoDurationDetected(dur);
                      }
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/20 p-8 text-center transition hover:border-purple-300 hover:bg-purple-50/50 aspect-video flex flex-col items-center justify-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-purple-600">
                    <FontAwesomeIcon icon={faFilm} className="text-xl" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Klik untuk memilih berkas video banner
                  </p>
                  <p className="text-xs text-slate-400">
                    Format MP4, WEBM, atau QuickTime (Maksimal 100MB, Rekomendasi Landscape 16:9)
                  </p>
                </div>
              )}
            </div>

            {/* Optional Poster for Video */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Poster / Gambar Cadangan (Opsional)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tampil sebelum video dimulai atau jika koneksi lambat.
                  </p>
                </div>
                {activeImageUrl ? (
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Hapus Poster
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-4">
                {activeImageUrl ? (
                  <div className="h-16 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shrink-0">
                    <img src={activeImageUrl} alt="Poster" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-28 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs shrink-0">
                    Tanpa Poster
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={disabled || imageUploading}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    {activeImageUrl ? "Ganti Poster" : "Pilih Poster"}
                  </button>
                  <span className="text-[10px] text-slate-400">Rekomendasi JPG/WEBP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUploadImage(file);
        }}
        disabled={disabled || imageUploading}
      />

      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        ref={videoInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUploadVideo(file);
        }}
        disabled={disabled || videoUploading}
      />
    </div>
  );
}
