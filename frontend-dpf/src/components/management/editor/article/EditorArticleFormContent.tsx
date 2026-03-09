import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import type { ArticleFormState } from "../../../../types/article";
import React from "react";

type EditorArticleFormContentProps = {
  form: ArticleFormState;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormState>>;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  canSubmit: boolean;
  bodyTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  bodyEnTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  contentImageInputRef: React.RefObject<HTMLInputElement | null>;
  rememberBodySelection: () => void;
  rememberBodyEnSelection: () => void;
  insertInlineTag: (field: "body" | "body_en", open: string, close: string, fallback: string) => void;
  uploadContentImage: (file: File) => Promise<string | null>;
  insertIntoBody: (snippet: string) => void;
  contentImageUploading: boolean;
  contentImageUploadError: string | null;
};

export default function EditorArticleFormContent({
  form,
  setForm,
  loading,
  saving,
  deleting,
  canSubmit,
  bodyTextareaRef,
  bodyEnTextareaRef,
  contentImageInputRef,
  rememberBodySelection,
  rememberBodyEnSelection,
  insertInlineTag,
  uploadContentImage,
  insertIntoBody,
  contentImageUploading,
  contentImageUploadError,
}: EditorArticleFormContentProps) {
  const disabled = loading || saving || deleting;

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-6">
        <label className="block">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Konten (Bahasa Indonesia) <span className="text-red-500">*</span>
            <span className="normal-case font-semibold tracking-normal text-slate-500">
              Bisa teks biasa atau HTML.
            </span>
          </span>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Sisipkan gambar langsung ke isi artikel.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onMouseDown={rememberBodySelection}
                onClick={() => contentImageInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canSubmit}
              >
                <FontAwesomeIcon icon={faPlus} />
                Sisipkan Gambar
              </button>
              <button
                type="button"
                onMouseDown={rememberBodySelection}
                onClick={() => insertInlineTag("body", "<strong>", "</strong>", "teks tebal")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canSubmit}
              >
                Tebal
              </button>
              <button
                type="button"
                onMouseDown={rememberBodySelection}
                onClick={() => insertInlineTag("body", "<em>", "</em>", "teks miring")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canSubmit}
              >
                Miring
              </button>
              {contentImageUploading && (
                <span className="text-xs font-semibold text-slate-500">Mengunggah...</span>
              )}
            </div>
          </div>

          <textarea
            value={form.body}
            onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
            onSelect={rememberBodySelection}
            onKeyUp={rememberBodySelection}
            onMouseUp={rememberBodySelection}
            onBlur={rememberBodySelection}
            rows={14}
            placeholder="Tulis isi artikel lengkap di sini..."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={bodyTextareaRef}
          />

          {contentImageUploadError && (
            <p className="mt-3 text-sm font-semibold text-red-700">{contentImageUploadError}</p>
          )}

          <input
            type="file"
            accept="image/*"
            aria-label="Unggah gambar konten artikel"
            className="hidden"
            ref={contentImageInputRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;

              const url = await uploadContentImage(file);
              if (!url) return;

              const snippet = `<img src=\"${url}\" alt=\"Gambar artikel\" loading=\"lazy\" />`;
              insertIntoBody(snippet);
            }}
            disabled={!canSubmit}
          />
        </label>

        <label className="block">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Konten (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
            <span className="normal-case font-semibold tracking-normal text-slate-500">
              Bisa teks biasa atau HTML.
            </span>
          </span>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onMouseDown={rememberBodyEnSelection}
              onClick={() => insertInlineTag("body_en", "<strong>", "</strong>", "bold text")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canSubmit}
            >
              Tebal
            </button>
            <button
              type="button"
              onMouseDown={rememberBodyEnSelection}
              onClick={() => insertInlineTag("body_en", "<em>", "</em>", "italic text")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canSubmit}
            >
              Miring
            </button>
          </div>

          <textarea
            value={form.body_en}
            onChange={(e) => setForm((s) => ({ ...s, body_en: e.target.value }))}
            onSelect={rememberBodyEnSelection}
            onKeyUp={rememberBodyEnSelection}
            onMouseUp={rememberBodyEnSelection}
            onBlur={rememberBodyEnSelection}
            rows={14}
            placeholder="Terjemahan isi artikel (opsional)."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={bodyEnTextareaRef}
          />
        </label>

        <p className="text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleInfo} className="opacity-70" />
            Pastikan judul, kategori, ringkasan, dan konten sudah terisi sebelum menyimpan.
          </span>
        </p>
      </div>
    </div>
  );
}
