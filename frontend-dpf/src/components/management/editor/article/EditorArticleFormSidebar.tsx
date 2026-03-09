import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faImage, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { ArticleFormState } from "../../../../types/article";
import React, { useState, useRef, useEffect } from "react";

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
  availableCategories: Array<{ category: string; category_en: string | null }>;
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
  availableCategories,
}: EditorArticleFormSidebarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const disabled = loading || saving || deleting;
  const currentThumbnail = thumbnailPreviewUrl || savedThumbnailUrl;

  const filteredCategories = availableCategories.filter((cat) =>
    cat.category.toLowerCase().includes(form.category.toLowerCase())
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Nama Penulis</span>
            <input
              value={form.author_name}
              onChange={(e) => setForm((s) => ({ ...s, author_name: e.target.value }))}
              placeholder="Contoh: Tim Redaksi"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Slug (URL)</span>
            <input
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
              placeholder="Otomatis-dari-judul"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            />
            <p className="mt-2 text-[10px] font-semibold text-slate-500">Gunakan (-) sebagai pemisah. Biarkan kosong untuk generate otomatis.</p>
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

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Program Terkait</span>
            <select
              value={form.program_id}
              onChange={(e) => setForm((s) => ({ ...s, program_id: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              disabled={disabled}
            >
              <option value="">Tidak ada program</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
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
    </div>
  );
}
