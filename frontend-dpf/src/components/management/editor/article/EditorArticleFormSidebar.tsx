import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faImage, faChevronDown, faVideo, faXmark, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import type { ArticleFormState } from "../../../../types/article";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { resolveStorageUrl } from "../../../../utils/management/editorArticleUtils";

type EditorArticleFormSidebarProps = {
  form: ArticleFormState;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormState>>;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  programOptions: Array<{ id: number; title: string }>;
  thumbnailUploading: boolean;
  thumbnailUploadError: string | null;
  thumbnailPreviewUrl: string | null;
  savedThumbnailUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadThumbnail: (file: File) => void;
  videoUploading?: boolean;
  videoUploadError?: string | null;
  videoFileInputRef?: React.RefObject<HTMLInputElement | null>;
  uploadVideo?: (file: File) => void;
  availableCategories: Array<{ category: string; category_en: string | null }>;
  availableAuthors?: string[];
};

export default function EditorArticleFormSidebar({
  form,
  setForm,
  loading,
  saving,
  deleting,
  programOptions,
  thumbnailUploading,
  thumbnailUploadError,
  thumbnailPreviewUrl,
  savedThumbnailUrl,
  fileInputRef,
  uploadThumbnail,
  videoUploading = false,
  videoUploadError = null,
  videoFileInputRef,
  uploadVideo,
  availableCategories,
  availableAuthors = [],
}: EditorArticleFormSidebarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authorDropdownRef = useRef<HTMLDivElement>(null);
  const disabled = loading || saving || deleting;
  const currentThumbnail = thumbnailPreviewUrl || savedThumbnailUrl;
  const currentVideo = useMemo(() => resolveStorageUrl(form.video_path) ?? null, [form.video_path]);

  const selectedProgramIds = useMemo(() => {
    if (Array.isArray(form.program_ids) && form.program_ids.length > 0) {
      return form.program_ids;
    }
    if (form.program_id && form.program_id.trim() !== "") {
      const parsed = Number(form.program_id);
      return isNaN(parsed) ? [] : [parsed];
    }
    return [];
  }, [form.program_ids, form.program_id]);

  const handleAddProgram = (programIdStr: string) => {
    const id = Number(programIdStr);
    if (!id || selectedProgramIds.includes(id)) return;
    const next = [...selectedProgramIds, id];
    setForm((s) => ({
      ...s,
      program_ids: next,
      program_id: next.length > 0 ? String(next[0]) : "",
    }));
  };

  const handleRemoveProgram = (idToRemove: number) => {
    const next = selectedProgramIds.filter((id) => id !== idToRemove);
    setForm((s) => ({
      ...s,
      program_ids: next,
      program_id: next.length > 0 ? String(next[0]) : "",
    }));
  };

  const handleClearAllPrograms = () => {
    setForm((s) => ({
      ...s,
      program_ids: [],
      program_id: "",
    }));
  };

  const unselectedPrograms = useMemo(() => {
    return programOptions.filter((p) => !selectedProgramIds.includes(p.id));
  }, [programOptions, selectedProgramIds]);

  const filteredCategories = availableCategories.filter((cat) =>
    cat.category.toLowerCase().includes(form.category.toLowerCase())
  );

  const filteredAuthors = availableAuthors.filter((author) =>
    author.toLowerCase().includes(form.author_name.toLowerCase())
  );

  const handleCategoryChange = (val: string) => {
    const existing = availableCategories.find(
      (c) => c.category.toLowerCase() === val.toLowerCase()
    );

    setForm((s) => ({
      ...s,
      category: val,
      category_en: existing ? (existing.category_en ?? "") : s.category_en,
    }));
  };

  const handleSelectCategory = (cat: { category: string; category_en: string | null }) => {
    setForm((s) => ({
      ...s,
      category: cat.category,
      category_en: cat.category_en ?? "",
    }));
    setShowDropdown(false);
  };

  const isExistingCategory = availableCategories.some(
    (c) => c.category.toLowerCase() === form.category.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target as Node)) {
        setShowAuthorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>
        
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            >
              <option value="draft">Draf (Hanya Internal)</option>
              <option value="published">Terbitkan Sekarang</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Jadwalkan Publikasi</span>
            <input
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => setForm((s) => ({ ...s, published_at: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
            <p className="mt-2 text-[10px] font-semibold text-slate-500">Jika kosong, akan mengikut saat tombol Terbit ditekan.</p>
          </label>

          <div className="relative" ref={authorDropdownRef}>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Nama Penulis</span>
              <div className="relative mt-2">
                <input
                  value={form.author_name}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, author_name: e.target.value }));
                    setShowAuthorDropdown(true);
                  }}
                  onFocus={() => setShowAuthorDropdown(true)}
                  onClick={() => setShowAuthorDropdown(true)}
                  placeholder="Ketik atau pilih nama penulis..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={disabled}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform duration-200 ${showAuthorDropdown ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </label>

            {showAuthorDropdown && filteredAuthors.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredAuthors.map((author, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setForm((s) => ({ ...s, author_name: author }));
                      setShowAuthorDropdown(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brandGreen-600"
                  >
                    <span>{author}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Slug / URL (Bahasa Indonesia)</span>
            <input
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
              placeholder="judul-artikel-id"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Slug / URL (English)</span>
            <input
              value={form.slug_en}
              onChange={(e) => setForm((s) => ({ ...s, slug_en: e.target.value }))}
              placeholder="article-title-en"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
            <p className="mt-2 text-[10px] font-semibold text-slate-500">Biarkan kosong jika ingin otomatis di-generate dari Judul.</p>
          </label>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Kategori (ID) <span className="text-red-500">*</span></span>
                <div className="relative mt-2">
                  <input
                    value={form.category}
                    onChange={(e) => {
                      handleCategoryChange(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onClick={() => setShowDropdown(true)}
                    placeholder="Ketik atau pilih kategori..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                    disabled={disabled}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                    <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </label>

              {showDropdown && filteredCategories.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredCategories.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brandGreen-600"
                    >
                      <span>{cat.category}</span>
                      {cat.category_en && <span className="text-[10px] font-medium text-slate-400 italic">({cat.category_en})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Kategori (EN)</span>
              <input
                value={form.category_en}
                onChange={(e) => setForm((s) => ({ ...s, category_en: e.target.value }))}
                placeholder={isExistingCategory ? "Otomatis terisi" : "Terjemahan Inggris..."}
                className={`mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brandGreen-400 ${
                  isExistingCategory ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white text-slate-900"
                }`}
                disabled={disabled || isExistingCategory}
              />
              {isExistingCategory && (
                <p className="mt-1 text-[10px] font-semibold text-brandGreen-600">Terjemahan terkunci karena kategori sudah ada.</p>
              )}
            </label>
          </div>

          {/* Program Terkait Multi-Select */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Program Terkait
              </span>
              {selectedProgramIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPrograms}
                  disabled={disabled}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Selected Programs List */}
            {selectedProgramIds.length > 0 ? (
              <div className="space-y-1.5">
                {selectedProgramIds.map((pId) => {
                  const programObj = programOptions.find((p) => p.id === pId);
                  const title = programObj?.title ?? `Program #${pId}`;
                  return (
                    <div
                      key={pId}
                      className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px]">
                          <FontAwesomeIcon icon={faHandHoldingHeart} />
                        </span>
                        <span className="truncate">{title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProgram(pId)}
                        disabled={disabled}
                        title="Hapus program ini"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-200/70 hover:text-emerald-900 transition"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Dropdown to add more */}
            <div>
              <select
                value=""
                onChange={(e) => handleAddProgram(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400 disabled:opacity-50"
                disabled={disabled || unselectedPrograms.length === 0}
              >
                <option value="" disabled>
                  {unselectedPrograms.length === 0
                    ? "Semua program telah terpilih"
                    : selectedProgramIds.length === 0
                    ? "+ Hubungkan Program Terkait..."
                    : "+ Hubungkan Program Lainnya..."}
                </option>
                {unselectedPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[10px] text-slate-500">
              {selectedProgramIds.length === 0
                ? "Opsional. Anda dapat menghubungkan satu atau beberapa program wakaf ke artikel ini."
                : `${selectedProgramIds.length} program wakaf terhubung dengan artikel ini.`}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-amber-300 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Thumbnail Artikel</p>
        
        <div className="mt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-300">
            {currentThumbnail ? (
              <>
                <img src={currentThumbnail} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, thumbnail_path: "" }))}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                  disabled={disabled}
                  title="Hapus gambar"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 transition hover:text-slate-600"
                disabled={disabled}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FontAwesomeIcon icon={faImage} className="text-xl" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider">Pilih Gambar</p>
                  <p className="mt-1 text-[10px] font-semibold opacity-60">Rekomendasi: 1200x630 (1.91:1)</p>
                </div>
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadThumbnail(file);
              e.target.value = "";
            }}
            disabled={disabled}
          />

          {thumbnailUploading && (
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
              Mengunggah...
            </div>
          )}

          {thumbnailUploadError && (
            <p className="mt-3 text-xs font-semibold text-red-600">{thumbnailUploadError}</p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={disabled || thumbnailUploading}
            >
              <FontAwesomeIcon icon={faPlus} />
              Ganti Gambar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-purple-400 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Video Utama Artikel (Opsional)</p>
        
        <div className="mt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-300">
            {currentVideo ? (
              <>
                <video
                  src={currentVideo}
                  controls
                  preload="metadata"
                  className="h-full w-full object-contain bg-black"
                />
                <button
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, video_path: "" }))}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                  disabled={disabled}
                  title="Hapus video"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => videoFileInputRef?.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 transition hover:text-slate-600"
                disabled={disabled}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FontAwesomeIcon icon={faVideo} className="text-xl text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Pilih Berkas Video</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">Format: .mp4, .webm (Max: 100MB)</p>
                </div>
              </button>
            )}
          </div>

          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            ref={videoFileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && uploadVideo) uploadVideo(file);
              e.target.value = "";
            }}
            disabled={disabled}
          />

          {videoUploading && (
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
              Mengunggah video...
            </div>
          )}

          {videoUploadError && (
            <p className="mt-3 text-xs font-semibold text-red-600">{videoUploadError}</p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => videoFileInputRef?.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={disabled || videoUploading}
            >
              <FontAwesomeIcon icon={faPlus} />
              {currentVideo ? "Ganti Video" : "Unggah Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
