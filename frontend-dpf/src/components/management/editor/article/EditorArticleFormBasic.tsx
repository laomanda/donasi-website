import React from "react";
import type { ArticleFormState } from "../../../../types/article";

type EditorArticleFormBasicProps = {
  form: ArticleFormState;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormState>>;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  excerptRef: React.RefObject<HTMLTextAreaElement | null>;
  excerptEnRef: React.RefObject<HTMLTextAreaElement | null>;
};

export default function EditorArticleFormBasic({
  form,
  setForm,
  loading,
  saving,
  deleting,
  excerptRef,
  excerptEnRef,
}: EditorArticleFormBasicProps) {
  const disabled = loading || saving || deleting;

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Judul (Bahasa Indonesia) <span className="text-red-500">*</span>
          </span>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            placeholder="Tulis judul artikel yang jelas dan ringkas."
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Judul (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
          </span>
          <input
            value={form.title_en}
            onChange={(e) => setForm((s) => ({ ...s, title_en: e.target.value }))}
            placeholder="Terjemahan judul (opsional)."
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Ringkasan (Bahasa Indonesia) <span className="text-red-500">*</span>
          </span>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
            rows={3}
            placeholder="Ringkasan singkat yang tampil di daftar artikel."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={excerptRef}
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Ringkasan (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
          </span>
          <textarea
            value={form.excerpt_en}
            onChange={(e) => setForm((s) => ({ ...s, excerpt_en: e.target.value }))}
            rows={3}
            placeholder="Terjemahan ringkasan (opsional)."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={excerptEnRef}
          />
        </label>
      </div>
    </div>
  );
}
