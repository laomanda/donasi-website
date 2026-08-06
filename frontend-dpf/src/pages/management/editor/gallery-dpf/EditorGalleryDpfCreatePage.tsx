import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import EditorGalleryDpfFormHeader from "@/components/management/editor/gallery-dpf/form/EditorGalleryDpfFormHeader";
import EditorGalleryDpfFormMain from "@/components/management/editor/gallery-dpf/form/EditorGalleryDpfFormMain";
import EditorGalleryDpfFormSidebar from "@/components/management/editor/gallery-dpf/form/EditorGalleryDpfFormSidebar";
import { emptyGalleryDpfForm, galleryDpfFolder, type GalleryDpfFormState } from "@/components/management/editor/gallery-dpf/GalleryDpfTypes";

const MAX_WORD_LENGTH = 25;
const MAX_CAPTION_LENGTH = 250;

const hasWordExceedingLength = (text: string, maxLength = MAX_WORD_LENGTH) => {
  if (!text.trim()) return false;
  const words = text.trim().split(/\s+/u);
  return words.some((word) => word.length > maxLength);
};

type ApiError = { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };

const getErrorMessages = (error: unknown, fallback: string) => {
  const payload = (error as ApiError)?.response?.data;
  const errors = payload?.errors;
  if (errors && typeof errors === "object") return Object.values(errors).flat().map(String);
  return [payload?.message ?? fallback];
};

export default function EditorGalleryDpfCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<GalleryDpfFormState>(emptyGalleryDpfForm);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onUpload = async (file: File) => {
    setUploadError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Format gambar harus JPG, JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(localUrl);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", galleryDpfFolder);
      const response = await http.post<{ path: string }>("/editor/uploads/image", data, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((current) => ({ ...current, image: response.data.path }));
      toast.success("Gambar berhasil diunggah.", { title: "Berhasil" });
    } catch {
      setUploadError("Gagal mengunggah gambar.");
      setForm((current) => ({ ...current, image: "" }));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    const validationErrors: string[] = [];
    if (!form.image) {
      validationErrors.push("Gambar aktivitas wajib diisi.");
    }

    if (!form.caption_id.trim()) {
      validationErrors.push("Caption Indonesia wajib diisi.");
    } else {
      if (form.caption_id.trim().length > MAX_CAPTION_LENGTH) {
        validationErrors.push(`Caption Indonesia maksimal ${MAX_CAPTION_LENGTH} karakter.`);
      }
      if (hasWordExceedingLength(form.caption_id, MAX_WORD_LENGTH)) {
        validationErrors.push(`Setiap kata pada Caption Indonesia maksimal ${MAX_WORD_LENGTH} karakter.`);
      }
    }

    if (!form.caption_en.trim()) {
      validationErrors.push("Caption English wajib diisi.");
    } else {
      if (form.caption_en.trim().length > MAX_CAPTION_LENGTH) {
        validationErrors.push(`Caption English maksimal ${MAX_CAPTION_LENGTH} karakter.`);
      }
      if (hasWordExceedingLength(form.caption_en, MAX_WORD_LENGTH)) {
        validationErrors.push(`Setiap kata pada Caption English maksimal ${MAX_WORD_LENGTH} karakter.`);
      }
    }

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      await http.post("/editor/gallery-dpf", form);
      toast.success("Aktivitas DPF berhasil dibuat.", { title: "Berhasil" });
      navigate("/editor/gallery-dpf", { replace: true });
    } catch (error) {
      setErrors(getErrorMessages(error, "Gagal membuat aktivitas DPF."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-20">
      <EditorGalleryDpfFormHeader mode="create" saving={saving} uploading={uploading} canSubmit={!saving && !uploading} onBack={() => navigate("/editor/gallery-dpf")} onSubmit={onSubmit} />
      {errors.length > 0 && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8"><EditorGalleryDpfFormMain form={form} previewUrl={previewUrl} uploading={uploading} uploadError={uploadError} disabled={saving} onUpload={onUpload} onRemove={() => { setForm((current) => ({ ...current, image: "" })); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} /></div>
        <div className="lg:col-span-4"><EditorGalleryDpfFormSidebar form={form} disabled={saving} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))} /></div>
      </div>
    </div>
  );
}
