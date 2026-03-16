import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

// Types & Utils
import type { EditorArticle, ArticleFormState } from "../../../../types/article";
import { emptyArticleForm } from "../../../../types/article";
import { 
  toLocalDateTimeInput, 
  normalizeErrors, 
  resolveStorageUrl, 
  autoResizeTextarea,
  rememberSelection
} from "../../../../utils/management/editorArticleUtils";

// Components
import EditorArticleFormHeader from "../../../../components/management/editor/article/EditorArticleFormHeader";
import EditorArticleFormBasic from "../../../../components/management/editor/article/EditorArticleFormBasic";
import EditorArticleFormContent from "../../../../components/management/editor/article/EditorArticleFormContent";
import EditorArticleFormSidebar from "../../../../components/management/editor/article/EditorArticleFormSidebar";
import EditorArticleFormDeleteZone from "../../../../components/management/editor/article/EditorArticleFormDeleteZone";

type Mode = "create" | "edit";

export function EditorArticleForm({ mode, articleId }: { mode: Mode; articleId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<ArticleFormState>(emptyArticleForm);
  const [programOptions, setProgramOptions] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{ category: string; category_en: string | null }>>([]);
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

  const isEditIdValid = typeof articleId === "number" && Number.isFinite(articleId) && articleId > 0;
  const canSubmit = (mode === "create" || isEditIdValid) && !loading && !saving && !thumbnailUploading && !contentImageUploading && !deleting;

  const savedThumbnailUrl = useMemo(() => resolveStorageUrl(form.thumbnail_path) ?? null, [form.thumbnail_path]);
  const publicArticleUrl = useMemo(() => form.slug.trim() ? `/articles/${form.slug.trim()}` : null, [form.slug]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl]);

  useEffect(() => { autoResizeTextarea(excerptRef.current); }, [form.excerpt]);
  useEffect(() => { autoResizeTextarea(excerptEnRef.current); }, [form.excerpt_en]);
  useEffect(() => { autoResizeTextarea(bodyTextareaRef.current); }, [form.body]);
  useEffect(() => { autoResizeTextarea(bodyEnRef.current); }, [form.body_en]);

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

    return () => { active = false; };
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

    http
      .get<Array<{ category: string; category_en: string | null }>>("/editor/articles/categories")
      .then((res) => setAvailableCategories(res.data ?? []))
      .catch(() => undefined);
  }, []);

  const uploadThumbnail = async (file: File) => {
    setThumbnailUploadError(null);
    setThumbnailUploading(true);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailPreviewUrl(URL.createObjectURL(file));

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
      setThumbnailPreviewUrl(null);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const rememberBodySelection = () => rememberSelection(bodyTextareaRef, bodySelectionRef);
  const rememberBodyEnSelection = () => rememberSelection(bodyEnRef, bodyEnSelectionRef);

  const insertInlineTag = (field: "body" | "body_en", openTag: string, closeTag: string, fallback: string) => {
    const textarea = field === "body" ? bodyTextareaRef.current : bodyEnRef.current;
    const selectionRef = field === "body" ? bodySelectionRef : bodyEnSelectionRef;
    const nextCursorRef = field === "body" ? bodyNextCursorRef : bodyEnNextCursorRef;
    const currentValue = field === "body" ? form.body : form.body_en;
    const fallbackLength = currentValue.length;
    const selection = textarea && Number.isFinite(textarea.selectionStart) && Number.isFinite(textarea.selectionEnd)
        ? { start: textarea.selectionStart, end: textarea.selectionEnd }
        : selectionRef.current ?? { start: fallbackLength, end: fallbackLength };

    setForm((state) => {
      const value = field === "body" ? state.body : state.body_en;
      const { start, end } = selection;
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
    const payload: any = {
      title: state.title.trim(),
      title_en: state.title_en.trim() || null,
      slug: state.slug.trim() || null,
      program_id: state.program_id.trim() === "" ? null : Number(state.program_id.trim()),
      category: state.category.trim(),
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

  const openPreview = () => {
    const storageKey = mode === "edit" && isEditIdValid ? `dpf_preview_article_${articleId}` : "dpf_preview_article_new";
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
    localStorage.setItem(storageKey, JSON.stringify(payload));
    window.open(`/preview?type=article&key=${encodeURIComponent(storageKey)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <EditorArticleFormHeader
        title={mode === "create" ? "Buat Artikel" : "Ubah Artikel"}
        mode={mode}
        onBack={() => navigate("/editor/articles")}
        onPreview={openPreview}
        onSubmit={onSubmit}
        saving={saving}
        canSubmit={canSubmit}
        loading={loading}
        deleting={deleting}
        publicUrl={publicArticleUrl}
        status={form.status}
      />

      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          <p className="font-bold">Periksa kembali data berikut:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((msg, idx) => <li key={idx}>{msg}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <EditorArticleFormBasic
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            deleting={deleting}
            excerptRef={excerptRef}
            excerptEnRef={excerptEnRef}
          />

          <EditorArticleFormContent
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            deleting={deleting}
            canSubmit={canSubmit}
            bodyTextareaRef={bodyTextareaRef}
            bodyEnTextareaRef={bodyEnRef}
            contentImageInputRef={contentImageInputRef}
            rememberBodySelection={rememberBodySelection}
            rememberBodyEnSelection={rememberBodyEnSelection}
            insertInlineTag={insertInlineTag}
            uploadContentImage={uploadContentImage}
            insertIntoBody={insertIntoBody}
            contentImageUploading={contentImageUploading}
            contentImageUploadError={contentImageUploadError}
          />

          {mode === "edit" && (
            <EditorArticleFormDeleteZone
              showConfirm={showDeleteConfirm}
              setShowConfirm={setShowDeleteConfirm}
              onDelete={onDelete}
              deleting={deleting}
              canSubmit={canSubmit}
            />
          )}
        </div>

        <EditorArticleFormSidebar
          form={form}
          setForm={setForm}
          loading={loading}
          saving={saving}
          deleting={deleting}
          programOptions={programOptions}
          thumbnailUploading={thumbnailUploading}
          thumbnailUploadError={thumbnailUploadError}
          thumbnailPreviewUrl={thumbnailPreviewUrl}
          savedThumbnailUrl={savedThumbnailUrl}
          fileInputRef={fileInputRef}
          uploadThumbnail={uploadThumbnail}
          availableCategories={availableCategories}
        />
      </div>
    </div>
  );
}

export default EditorArticleForm;
