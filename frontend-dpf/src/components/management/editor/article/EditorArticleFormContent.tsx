import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCircleInfo,
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faLink,
  faXmark,
  faCheck,
  faVideo,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
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
  contentVideoInputRef?: React.RefObject<HTMLInputElement | null>;
  rememberBodySelection: () => void;
  rememberBodyEnSelection: () => void;
  insertInlineTag: (field: "body" | "body_en", open: string, close: string, fallback: string) => void;
  uploadContentImage: (file: File) => Promise<string | null>;
  uploadContentVideo?: (file: File) => Promise<string | null>;
  insertIntoBody: (snippet: string) => void;
  insertIntoField?: (field: "body" | "body_en", snippet: string, isBlock?: boolean) => void;
  contentImageUploading: boolean;
  contentImageUploadError: string | null;
  contentVideoUploading?: boolean;
  contentVideoUploadError?: string | null;
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
  contentVideoInputRef,
  rememberBodySelection,
  rememberBodyEnSelection,
  insertInlineTag,
  uploadContentImage,
  uploadContentVideo,
  insertIntoBody,
  insertIntoField,
  contentImageUploading,
  contentImageUploadError,
  contentVideoUploading = false,
  contentVideoUploadError = null,
}: EditorArticleFormContentProps) {
  const disabled = loading || saving || deleting;

  // Melacak field mana yang sedang ditargetkan saat menyisipkan media (gambar/video)
  const [activeMediaField, setActiveMediaField] = useState<"body" | "body_en">("body");

  const [activeLinkField, setActiveLinkField] = useState<"body" | "body_en" | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const doInsert = (field: "body" | "body_en", snippet: string, isBlock = true) => {
    if (insertIntoField) {
      insertIntoField(field, snippet, isBlock);
    } else {
      insertIntoBody(snippet);
    }
  };

  // Ekstraksi URL gambar dari konten Bahasa Indonesia dan Bahasa Inggris
  const extractImageUrls = (content: string | null | undefined): string[] => {
    if (!content) return [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    const urls: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      if (match[1] && !urls.includes(match[1])) {
        urls.push(match[1]);
      }
    }
    return urls;
  };

  const bodyImages = useMemo(() => extractImageUrls(form.body), [form.body]);
  const bodyEnImages = useMemo(() => extractImageUrls(form.body_en), [form.body_en]);
  const uninsertedImages = useMemo(
    () => bodyImages.filter((url) => !bodyEnImages.includes(url)),
    [bodyImages, bodyEnImages]
  );

  const openLinkPopover = (field: "body" | "body_en") => {
    if (field === "body") rememberBodySelection();
    else rememberBodyEnSelection();

    const textarea = field === "body" ? bodyTextareaRef.current : bodyEnTextareaRef.current;
    const bodyVal = field === "body" ? form.body : form.body_en;

    let selected = "";
    if (textarea && typeof textarea.selectionStart === "number" && typeof textarea.selectionEnd === "number") {
      selected = bodyVal.slice(textarea.selectionStart, textarea.selectionEnd);
    }

    setLinkError(null);
    setLinkUrl("");
    setLinkText(selected);
    setActiveLinkField(field);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLinkField) return;

    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      setLinkError("URL tautan tidak boleh kosong.");
      return;
    }

    let cleanUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith("/") && !cleanUrl.startsWith("#")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const cleanText = linkText.trim() || (activeLinkField === "body" ? "Teks tautan" : "Link text");
    const openTag = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">`;
    const closeTag = `</a>`;

    insertInlineTag(activeLinkField, openTag, closeTag, cleanText);

    setActiveLinkField(null);
    setLinkUrl("");
    setLinkText("");
    setLinkError(null);
  };

  const renderToolbar = (field: "body" | "body_en") => {
    const isBody = field === "body";
    const rememberFn = isBody ? rememberBodySelection : rememberBodyEnSelection;

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sisipkan Gambar */}
          <button
            type="button"
            onMouseDown={() => {
              setActiveMediaField(field);
              rememberFn();
            }}
            onClick={() => {
              setActiveMediaField(field);
              contentImageInputRef.current?.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit || contentImageUploading}
            title={isBody ? "Sisipkan Gambar ke Konten Indonesia" : "Sisipkan Gambar ke Konten Bahasa Inggris"}
          >
            <FontAwesomeIcon icon={faImage} />
            <span>Gambar</span>
          </button>

          {/* Sisipkan Video */}
          <button
            type="button"
            onMouseDown={() => {
              setActiveMediaField(field);
              rememberFn();
            }}
            onClick={() => {
              setActiveMediaField(field);
              contentVideoInputRef?.current?.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-200 bg-purple-50/60 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-sm transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit || contentVideoUploading}
            title={isBody ? "Sisipkan Video ke Konten Indonesia" : "Sisipkan Video ke Konten Bahasa Inggris"}
          >
            <FontAwesomeIcon icon={faVideo} />
            <span>Video</span>
          </button>

          {/* Subheading H2 */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() =>
              insertInlineTag(field, "<h2>", "</h2>", isBody ? "Judul Bagian" : "Section Heading")
            }
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Heading 2 (Judul Bagian)"
          >
            <span className="font-heading">H2</span>
          </button>

          {/* Subheading H3 */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() =>
              insertInlineTag(field, "<h3>", "</h3>", isBody ? "Sub-Judul Bagian" : "Sub-heading")
            }
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Heading 3 (Sub-judul)"
          >
            <span className="font-heading">H3</span>
          </button>

          {/* Paragraf */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() =>
              insertInlineTag(field, "<p>", "</p>", isBody ? "Teks paragraf baru" : "New paragraph text")
            }
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Bungkus Paragraf (<p>)"
          >
            <span>&para; P</span>
          </button>

          {/* Tebal */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() => insertInlineTag(field, "<strong>", "</strong>", isBody ? "teks tebal" : "bold text")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Tebal"
          >
            <FontAwesomeIcon icon={faBold} />
            <span>Tebal</span>
          </button>

          {/* Miring */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() => insertInlineTag(field, "<em>", "</em>", isBody ? "teks miring" : "italic text")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Miring"
          >
            <FontAwesomeIcon icon={faItalic} />
            <span>Miring</span>
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() =>
              insertInlineTag(
                field,
                "<ul>\n  <li>",
                "</li>\n  <li>Item kedua</li>\n</ul>",
                isBody ? "Item pertama" : "First item"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Bullet List"
          >
            <FontAwesomeIcon icon={faListUl} />
            <span>List</span>
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() =>
              insertInlineTag(
                field,
                "<ol>\n  <li>",
                "</li>\n  <li>Langkah kedua</li>\n</ol>",
                isBody ? "Langkah pertama" : "First step"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSubmit}
            title="Numbered List"
          >
            <FontAwesomeIcon icon={faListOl} />
            <span>Nomor</span>
          </button>

          {/* Tautan */}
          <button
            type="button"
            onMouseDown={rememberFn}
            onClick={() => openLinkPopover(field)}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
              activeLinkField === field
                ? "border-brandGreen-600 bg-brandGreen-50 text-brandGreen-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            disabled={!canSubmit}
            title="Sisipkan Tautan"
          >
            <FontAwesomeIcon icon={faLink} />
            <span>Tautan</span>
          </button>

          {activeMediaField === field && contentImageUploading && (
            <span className="text-xs font-semibold text-slate-500 animate-pulse">Mengunggah gambar...</span>
          )}

          {activeMediaField === field && contentVideoUploading && (
            <span className="text-xs font-semibold text-purple-600 animate-pulse">Mengunggah video...</span>
          )}

          {activeMediaField === field && contentVideoUploadError && (
            <span className="text-xs font-semibold text-red-600">{contentVideoUploadError}</span>
          )}
        </div>

        {activeLinkField === field && (
          <form
            onSubmit={handleInsertLink}
            className="rounded-2xl border border-brandGreen-200 bg-brandGreen-50/60 p-4 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brandGreen-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faLink} />
                Sisipkan Tautan ({isBody ? "Bahasa Indonesia" : "Bahasa Inggris"})
              </h4>
              <button
                type="button"
                onClick={() => setActiveLinkField(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  URL Tautan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError(null);
                  }}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-brandGreen-500 focus:outline-none focus:ring-1 focus:ring-brandGreen-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Teks Tautan
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Teks yang dapat diklik"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-brandGreen-500 focus:outline-none focus:ring-1 focus:ring-brandGreen-500"
                />
              </div>
            </div>

            {linkError && <p className="text-xs font-semibold text-red-600">{linkError}</p>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveLinkField(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brandGreen-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brandGreen-700 transition"
              >
                <FontAwesomeIcon icon={faCheck} />
                Sisipkan
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-6">
        {/* FIELD KONTEN BAHASA INDONESIA */}
        <label className="block">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Konten (Bahasa Indonesia) <span className="text-red-500">*</span>
            <span className="normal-case font-semibold tracking-normal text-slate-500">
              Bisa teks biasa atau kode HTML. Format HTML tetap terjaga rapi saat menyisipkan foto.
            </span>
          </span>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Gunakan toolbar untuk menyisipkan gambar, heading, paragraf, atau tautan.
            </p>
            {renderToolbar("body")}
          </div>

          <textarea
            value={form.body}
            onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
            onSelect={rememberBodySelection}
            onKeyUp={rememberBodySelection}
            onMouseUp={rememberBodySelection}
            onBlur={rememberBodySelection}
            rows={14}
            placeholder="Tulis atau paste isi artikel berformat HTML / teks di sini..."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={bodyTextareaRef}
          />

          {contentImageUploadError && (
            <p className="mt-3 text-sm font-semibold text-red-700">{contentImageUploadError}</p>
          )}
        </label>

        {/* FIELD KONTEN BAHASA INGGRIS */}
        <div className="block space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Konten (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
              <span className="normal-case font-semibold tracking-normal text-slate-500">
                Bisa teks biasa atau kode HTML.
              </span>
            </span>
          </div>

          {/* KETERANGAN STATUS FOTO BAHASA INGGRIS */}
          {bodyImages.length > 0 && uninsertedImages.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/85 p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FontAwesomeIcon icon={faCircleInfo} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Keterangan: Foto Belum Dimasukkan ke Versi Bahasa Inggris
                    </h4>
                    <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                      {uninsertedImages.length} dari {bodyImages.length} foto tersedia
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                    Foto pada artikel versi Indonesia belum dimasukkan ke versi Bahasa Inggris ini. Klik tombol di bawah untuk menyisipkan foto ke posisi kursor teks Bahasa Inggris:
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {uninsertedImages.map((imgUrl) => {
                      const originalIndex = bodyImages.indexOf(imgUrl) + 1;
                      return (
                        <div
                          key={imgUrl}
                          className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-white p-1.5 pr-3 shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${originalIndex}`}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700">Foto {originalIndex}</span>
                            <button
                              type="button"
                              onMouseDown={rememberBodyEnSelection}
                              onClick={() => {
                                const snippet = `<img src="${imgUrl}" alt="Article image" loading="lazy" />`;
                                doInsert("body_en", snippet, true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brandGreen-700 hover:text-brandGreen-800 hover:underline text-left"
                              title="Sisipkan foto ini pada posisi kursor Bahasa Inggris"
                              disabled={disabled}
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                              Sisipkan ke Kursor
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {uninsertedImages.length > 1 && (
                      <button
                        type="button"
                        onMouseDown={rememberBodyEnSelection}
                        onClick={() => {
                          const snippetAll = uninsertedImages
                            .map((url) => `<img src="${url}" alt="Article image" loading="lazy" />`)
                            .join("\n\n");
                          doInsert("body_en", snippetAll, true);
                        }}
                        className="self-center rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition"
                        disabled={disabled}
                        title="Sisipkan semua foto yang belum ada ke posisi kursor Bahasa Inggris"
                      >
                        Sisipkan Semua ({uninsertedImages.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {bodyImages.length > 0 && uninsertedImages.length === 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
              <span className="flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
                Semua foto dari versi Indonesia ({bodyImages.length} foto) sudah dimasukkan ke konten Bahasa Inggris.
              </span>
            </div>
          )}

          <div className="mt-3">
            {renderToolbar("body_en")}
          </div>

          <textarea
            value={form.body_en}
            onChange={(e) => setForm((s) => ({ ...s, body_en: e.target.value }))}
            onSelect={rememberBodyEnSelection}
            onKeyUp={rememberBodyEnSelection}
            onMouseUp={rememberBodyEnSelection}
            onBlur={rememberBodyEnSelection}
            rows={14}
            placeholder="Terjemahan isi artikel (opsional). Anda dapat menyisipkan foto secara bebas di posisi manapun."
            className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            disabled={disabled}
            ref={bodyEnTextareaRef}
          />
        </div>

        <p className="text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleInfo} className="opacity-70" />
            Pastikan judul, kategori, ringkasan, dan konten sudah terisi sebelum menyimpan.
          </span>
        </p>

        {/* INPUT FILE UNTUK GAMBAR (DIPAKAI OLEH BODY MAUPUN BODY_EN) */}
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

            const altText = activeMediaField === "body" ? "Gambar artikel" : "Article image";
            const snippet = `<img src="${url}" alt="${altText}" loading="lazy" />`;
            doInsert(activeMediaField, snippet, true);
          }}
          disabled={!canSubmit}
        />

        {/* INPUT FILE UNTUK VIDEO PARAGRAF */}
        {contentVideoInputRef && (
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            ref={contentVideoInputRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file && uploadContentVideo) {
                const videoUrl = await uploadContentVideo(file);
                if (videoUrl) {
                  const videoSnippet = `<video controls preload="metadata" class="my-6 w-full rounded-2xl shadow-md overflow-hidden bg-black aspect-video" src="${videoUrl}"></video>`;
                  doInsert(activeMediaField, videoSnippet, true);
                }
              }
              e.target.value = "";
            }}
            disabled={!canSubmit}
          />
        )}
      </div>
    </div>
  );
}
