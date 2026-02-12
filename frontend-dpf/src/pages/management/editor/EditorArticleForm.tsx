import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faEye,
  faImage,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { translateCategoryToEn, CATEGORY_OPTIONS } from "../../../lib/categoryTranslations";

type EditorArticle = {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  program_id?: number | null;
  category: string;
  category_en?: string | null;
  excerpt: string;
  excerpt_en?: string | null;
  body: string;
  body_en?: string | null;
  status: string;
  author_name?: string | null;
  thumbnail_path?: string | null;
  published_at?: string | null;
};

type ArticleFormState = {
  title: string;
  title_en: string;
  slug: string;
  category: string;
  category_en: string;
  author_name: string;
  program_id: string;
  thumbnail_path: string;
  excerpt: string;
  excerpt_en: string;
  body: string;
  body_en: string;
  status: "draft" | "review" | "published";
  published_at: string;
};

const emptyForm: ArticleFormState = {
  title: "",
  title_en: "",
  slug: "",
  category: "",
  category_en: "",
  author_name: "",
  program_id: "",
  thumbnail_path: "",
  excerpt: "",
  excerpt_en: "",
  body: "",
  body_en: "",
  status: "draft",
  published_at: "",
};

const toLocalDateTimeInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
    else if (value) messages.push(String(value));
  }
  return messages.length ? messages : ["Validasi gagal."];
};

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend =
    import.meta.env.VITE_BACKEND_URL ??
    api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const rememberSelection = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  selectionRef: React.MutableRefObject<{ start: number; end: number } | null>
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = Number.isFinite(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
  const end = Number.isFinite(textarea.selectionEnd) ? textarea.selectionEnd : textarea.value.length;
  selectionRef.current = { start, end };
};

type Mode = "create" | "edit";

export function EditorArticleForm({ mode, articleId }: { mode: Mode; articleId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<ArticleFormState>(emptyForm);
  const [programOptions, setProgramOptions] = useState<Array<{ id: number; title: string }>>([]);
    const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const excerptRef = useRef<HTMLTextAreaElement | null>(null);
  const excerptEnRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bodySelectionRef = useRef<{ start: number; end: number } | null>(null);
  const bodyNextCursorRef = useRef<number | null>(null);
  const bodyEnRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyEnSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const bodyEnNextCursorRef = useRef<number | null>(null);

  const [contentImageUploading, setContentImageUploading] = useState(false);
  const [contentImageUploadError, setContentImageUploadError] = useState<string | null>(null);
  const contentImageInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditIdValid =
    typeof articleId === "number" && Number.isFinite(articleId) && articleId > 0;
  const canSubmit =
    (mode === "create" || isEditIdValid) &&
    !loading &&
    !saving &&
    !thumbnailUploading &&
    !contentImageUploading &&
    !deleting;

  const savedThumbnailUrl = useMemo(() => {
    const url = resolveStorageUrl(form.thumbnail_path);
    return url;
  }, [form.thumbnail_path]);

  const publicArticleUrl = useMemo(() => {
    const slug = form.slug.trim();
    if (!slug) return null;
    return `/articles/${slug}`;
  }, [form.slug]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl]);

  useEffect(() => {
    autoResizeTextarea(excerptRef.current);
  }, [form.excerpt]);

  useEffect(() => {
    autoResizeTextarea(excerptEnRef.current);
  }, [form.excerpt_en]);

  useEffect(() => {
    autoResizeTextarea(bodyTextareaRef.current);
  }, [form.body]);

  useEffect(() => {
    autoResizeTextarea(bodyEnRef.current);
  }, [form.body_en]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID artikel tidak valid."]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setErrors([]);
    http
      .get<EditorArticle>(`/editor/articles/${articleId}`)
      .then((res) => {
        if (!active) return;
        const a = res.data;
        setForm({
          title: a.title ?? "",
          title_en: a.title_en ?? "",
          slug: a.slug ?? "",
          program_id: a.program_id ? String(a.program_id) : "",
          category: a.category ?? "",
          category_en: a.category_en ?? "",
          author_name: a.author_name ?? "",
          thumbnail_path: a.thumbnail_path ?? "",
          excerpt: a.excerpt ?? "",
          excerpt_en: a.excerpt_en ?? "",
          body: a.body ?? "",
          body_en: a.body_en ?? "",
          status: (String(a.status ?? "draft").toLowerCase() as any) ?? "draft",
          published_at: a.published_at ? toLocalDateTimeInput(a.published_at) : "",
        });
      })
      .catch((err) => {
        if (!active) return;
        setErrors(normalizeErrors(err));
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [mode, articleId, isEditIdValid]);

  useEffect(() => {
    http
      .get("/editor/programs", { params: { status: "active", per_page: 100 } })
      .then((res) => {
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        const options = items.map((p: any) => ({ id: p.id, title: p.title ?? `Program ${p.id}` }));
        setProgramOptions(options);
      })
      .catch(() => undefined);
  }, []);



  const uploadThumbnail = async (file: File) => {
    setThumbnailUploadError(null);
    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads/articles");

      const res = await http.post<{ path?: string; url?: string }>("/editor/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const path = String(res.data?.path ?? "").trim();
      if (!path) throw new Error("Upload gagal: path kosong.");
      setForm((s) => ({ ...s, thumbnail_path: path }));
    } catch (err: any) {
      setThumbnailUploadError(normalizeErrors(err).join(" "));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const rememberBodySelection = () => {
    rememberSelection(bodyTextareaRef, bodySelectionRef);
  };

  const rememberBodyEnSelection = () => {
    rememberSelection(bodyEnRef, bodyEnSelectionRef);
  };

  const insertInlineTag = (
    field: "body" | "body_en",
    openTag: string,
    closeTag: string,
    fallback: string
  ) => {
    const textarea = field === "body" ? bodyTextareaRef.current : bodyEnRef.current;
    const selectionRef = field === "body" ? bodySelectionRef : bodyEnSelectionRef;
    const nextCursorRef = field === "body" ? bodyNextCursorRef : bodyEnNextCursorRef;
    const currentValue = field === "body" ? form.body : form.body_en;
    const fallbackLength = currentValue.length;
    const selection =
      textarea && Number.isFinite(textarea.selectionStart) && Number.isFinite(textarea.selectionEnd)
        ? { start: textarea.selectionStart, end: textarea.selectionEnd }
        : selectionRef.current ?? { start: fallbackLength, end: fallbackLength };

    setForm((state) => {
      const value = field === "body" ? state.body : state.body_en;
      const start = selection.start;
      const end = selection.end;
      const selected = value.slice(start, end);
      const content = selected || fallback;
      const nextValue = `${value.slice(0, start)}${openTag}${content}${closeTag}${value.slice(end)}`;
      nextCursorRef.current = start + openTag.length + content.length;
      return field === "body" ? { ...state, body: nextValue } : { ...state, body_en: nextValue };
    });

    requestAnimationFrame(() => {
      const el = field === "body" ? bodyTextareaRef.current : bodyEnRef.current;
      const cursor = nextCursorRef.current;
      if (!el || cursor === null) return;
      el.focus();
      el.setSelectionRange(cursor, cursor);
      nextCursorRef.current = null;
    });
  };

  const insertIntoBody = (snippet: string) => {
    setForm((state) => {
      const value = String(state.body ?? "");
      const selection = bodySelectionRef.current;
      const start = selection?.start ?? value.length;
      const end = selection?.end ?? value.length;

      const before = value.slice(0, start);
      const after = value.slice(end);

      const needsLeadingNewline = before !== "" && !before.endsWith("\n");
      const needsTrailingNewline = after !== "" && !after.startsWith("\n");

      const finalSnippet = `${needsLeadingNewline ? "\n" : ""}${snippet}${needsTrailingNewline ? "\n" : ""}`;
      const nextBody = `${before}${finalSnippet}${after}`;

      bodyNextCursorRef.current = (before + finalSnippet).length;
      return { ...state, body: nextBody };
    });

    requestAnimationFrame(() => {
      const textarea = bodyTextareaRef.current;
      const cursor = bodyNextCursorRef.current;
      if (!textarea || cursor === null) return;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
      bodyNextCursorRef.current = null;
    });
  };

  const uploadContentImage = async (file: File) => {
    setContentImageUploadError(null);
    setContentImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads/articles/content");

      const res = await http.post<{ path?: string; url?: string }>("/editor/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const raw = String(res.data?.url ?? res.data?.path ?? "").trim();
      const url = resolveStorageUrl(raw);
      if (!url) throw new Error("Upload gagal: url kosong.");
      return url;
    } catch (err: any) {
      setContentImageUploadError(normalizeErrors(err).join(" "));
      return null;
    } finally {
      setContentImageUploading(false);
    }
  };

  const payloadForRequest = (state: ArticleFormState) => {
    const normalizedCategory = state.category.trim();
    const payload: any = {
      title: state.title.trim(),
      title_en: state.title_en.trim() || null,
      slug: state.slug.trim() || null,
      program_id: state.program_id.trim() === "" ? null : Number(state.program_id.trim()),
      category: normalizedCategory,
      category_en: state.category_en.trim() || null,
      thumbnail_path: state.thumbnail_path.trim() || null,
      excerpt: state.excerpt.trim(),
      excerpt_en: state.excerpt_en.trim() || null,
      body: state.body.trim(),
      body_en: state.body_en.trim() || null,
      author_name: state.author_name.trim() || null,
      status: state.status,
      published_at: state.published_at ? new Date(state.published_at).toISOString() : null,
    };
    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }
    return payload;
  };

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID artikel tidak valid."]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const payload = payloadForRequest(form);
      if (mode === "create") {
        await http.post("/editor/articles", payload);
        toast.success("Artikel berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`/editor/articles/${articleId}`, payload);
        toast.success("Perubahan artikel berhasil disimpan.", { title: "Berhasil" });
      }
      navigate("/editor/articles", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID artikel tidak valid."]);
      return;
    }
    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/editor/articles/${articleId}`);
      toast.success("Artikel berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/articles", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Buat Artikel" : "Ubah Artikel";

  const openPreview = () => {
    const storageKey =
      mode === "edit" && isEditIdValid ? `dpf_preview_article_${articleId}` : "dpf_preview_article_new";

    const payload = {
      type: "article",
      created_at: new Date().toISOString(),
      return_to: typeof window !== "undefined" ? window.location.pathname + window.location.search : "/editor/articles",
      article: {
        title: form.title,
        slug: form.slug,
        category: form.category,
        author_name: form.author_name,
        excerpt: form.excerpt,
        body: form.body,
        status: form.status,
        published_at: form.published_at,
        thumbnail_url: thumbnailPreviewUrl ?? savedThumbnailUrl ?? null,
      },
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }

    window.open(`/preview?type=article&key=${encodeURIComponent(storageKey)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Artikel
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Buat draf baru, ajukan peninjauan, atau terbitkan langsung."
                : "Perbarui konten artikel agar tetap rapi dan konsisten."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/articles")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || thumbnailUploading || deleting}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>

            {mode === "edit" && publicArticleUrl && form.status === "published" ? (
              <button
                type="button"
                onClick={() => window.open(publicArticleUrl, "_blank")}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-300"
              >
                <FontAwesomeIcon icon={faEye} />
                Lihat Publik
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => openPreview()}
              className="inline-flex items-center gap-2 rounded-2xl border border-sky-600 bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading || saving || deleting}
            >
              <FontAwesomeIcon icon={faEye} />
              Pratinjau
            </button>

            <button
              type="button"
              onClick={() => void onSubmit()}
              className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canSubmit}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          <p className="font-bold">Periksa kembali data berikut:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.slice(0, 8).map((msg, idx) => (
              <li key={idx} className="font-semibold">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
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
                  disabled={loading || saving || deleting}
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
                  disabled={loading || saving || deleting}
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
                  disabled={loading || saving || deleting}
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
                  disabled={loading || saving || deleting}
                  ref={excerptEnRef}
                />
              </label>

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
                      onMouseDown={() => rememberBodySelection()}
                      onClick={() => contentImageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={!canSubmit}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Sisipkan Gambar
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => rememberBodySelection()}
                      onClick={() => insertInlineTag("body", "<strong>", "</strong>", "teks tebal")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={!canSubmit}
                    >
                      Tebal
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => rememberBodySelection()}
                      onClick={() => insertInlineTag("body", "<em>", "</em>", "teks miring")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={!canSubmit}
                    >
                      Miring
                    </button>
                    {contentImageUploading ? (
                      <span className="text-xs font-semibold text-slate-500">Mengunggah...</span>
                    ) : null}
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
                  disabled={loading || saving || deleting}
                  ref={bodyTextareaRef}
                />

                {contentImageUploadError ? (
                  <p className="mt-3 text-sm font-semibold text-red-700">{contentImageUploadError}</p>
                ) : null}

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
                    onMouseDown={() => rememberBodyEnSelection()}
                    onClick={() => insertInlineTag("body_en", "<strong>", "</strong>", "bold text")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={!canSubmit}
                  >
                    Tebal
                  </button>
                  <button
                    type="button"
                    onMouseDown={() => rememberBodyEnSelection()}
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
                  disabled={loading || saving || deleting}
                  ref={bodyEnRef}
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

          {mode === "edit" && (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus Artikel</h2>
              <p className="mt-2 text-sm text-slate-600">
                Menghapus artikel akan menghilangkan konten dari sistem. Tindakan ini tidak bisa dibatalkan.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                  disabled={!canSubmit}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Artikel
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
                      onClick={() => void onDelete()}
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

        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Status Publikasi <span className="text-red-500">*</span>
                </span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}
                  aria-label="Status publikasi"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                >
                  <option value="draft">Draf</option>
                  <option value="review">Peninjauan</option>
                  <option value="published">Terbit</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Kategori (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((s) => {
                      const next = { ...s, category: value };
                      const en = translateCategoryToEn(value);
                      if (en) {
                          next.category_en = en;
                      }
                      return next;
                    });
                  }}
                  placeholder="Contoh: Berita"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
                <datalist id="category-suggestions">
                    {CATEGORY_OPTIONS.sort().map((opt) => (
                        <option key={opt} value={opt} />
                    ))}
                </datalist>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Kategori (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  value={form.category_en}
                  onChange={(e) => setForm((s) => ({ ...s, category_en: e.target.value }))}
                  placeholder="Contoh: News"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Slug
                  <span className="ml-2 normal-case font-semibold tracking-normal text-slate-500">(opsional)</span>
                </span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                  placeholder="Contoh: panduan-wakaf"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Tautkan ke Program <span className="text-slate-400">(opsional)</span>
                </span>
                <select
                  value={form.program_id}
                  onChange={(e) => setForm((s) => ({ ...s, program_id: e.target.value }))}
                  aria-label="Tautkan ke program"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                >
                  <option value="">Tidak ditautkan</option>
                  {programOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Penulis
                  <span className="ml-2 normal-case font-semibold tracking-normal text-slate-500">(opsional)</span>
                </span>
                <input
                  value={form.author_name}
                  onChange={(e) => setForm((s) => ({ ...s, author_name: e.target.value }))}
                  placeholder="Nama penulis (jika berbeda dari editor)."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Tanggal Publikasi
                  <span className="ml-2 normal-case font-semibold tracking-normal text-slate-500">(opsional)</span>
                </span>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm((s) => ({ ...s, published_at: e.target.value }))}
                  aria-label="Tanggal publikasi"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading || saving || deleting || form.status !== "published"}
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Thumbnail</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Unggah gambar sampul artikel.</p>
                    <p className="mt-1 text-xs text-slate-500">Format jpg/png/webp, maks. 4 MB.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Pilih Gambar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                      setThumbnailPreviewUrl(null);
                      setForm((s) => ({ ...s, thumbnail_path: "" }));
                      setThumbnailUploadError(null);
                    }}
                    disabled={!canSubmit || (!thumbnailPreviewUrl && !form.thumbnail_path)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hapus
                  </button>

                  {thumbnailUploading ? (
                    <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
                  ) : form.thumbnail_path ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Tersimpan
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    {thumbnailPreviewUrl || savedThumbnailUrl ? (
                      <img
                        src={thumbnailPreviewUrl ?? savedThumbnailUrl ?? undefined}
                        alt=""
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm font-semibold text-slate-500">
                        Tidak ada pratinjau.
                      </div>
                    )}
                  </div>
                </div>

                {thumbnailUploadError && <p className="mt-3 text-sm font-semibold text-red-700">{thumbnailUploadError}</p>}

                <input
                  type="file"
                  accept="image/*"
                  aria-label="Unggah thumbnail artikel"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                    setThumbnailPreviewUrl(URL.createObjectURL(file));
                    void uploadThumbnail(file);
                  }}
                  disabled={!canSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorArticleForm;

