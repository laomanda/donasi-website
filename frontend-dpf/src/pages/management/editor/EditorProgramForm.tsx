import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faImage,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type EditorProgram = {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  category: string;
  category_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  description: string;
  description_en?: string | null;
  benefits?: string | null;
  benefits_en?: string | null;
  target_amount: number | string;
  collected_amount?: number | string | null;
  deadline_days?: number | string | null;
  thumbnail_path?: string | null;
  banner_path?: string | null;
  is_highlight?: boolean | null;
  status: string;
};

type ProgramFormState = {
  title: string;
  title_en: string;
  slug: string;
  category: string;
  category_en: string;
  short_description: string;
  short_description_en: string;
  description: string;
  description_en: string;
  benefits: string;
  benefits_en: string;
  target_amount: string;
  deadline_days: string;
  thumbnail_path: string;
  banner_path: string;
  is_highlight: boolean;
  status: "draft" | "active" | "completed" | "archived";
};

const emptyForm: ProgramFormState = {
  title: "",
  title_en: "",
  slug: "",
  category: "",
  category_en: "",
  short_description: "",
  short_description_en: "",
  description: "",
  description_en: "",
  benefits: "",
  benefits_en: "",
  target_amount: "",
  deadline_days: "",
  thumbnail_path: "",
  banner_path: "",
  is_highlight: false,
  status: "draft",
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
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

type Mode = "create" | "edit";

export function EditorProgramForm({ mode, programId }: { mode: Mode; programId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<ProgramFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState<number | string | null>(null);

  const isEditIdValid = typeof programId === "number" && Number.isFinite(programId) && programId > 0;
  const canSubmit =
    (mode === "create" || isEditIdValid) &&
    !loading &&
    !saving &&
    !thumbnailUploading &&
    !bannerUploading &&
    !deleting;

  const savedThumbnailUrl = useMemo(() => resolveStorageUrl(form.thumbnail_path), [form.thumbnail_path]);
  const savedBannerUrl = useMemo(() => resolveStorageUrl(form.banner_path), [form.banner_path]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [thumbnailPreviewUrl, bannerPreviewUrl]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID program tidak valid."]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setErrors([]);
    http
      .get<EditorProgram>(`/editor/programs/${programId}`)
      .then((res) => {
        if (!active) return;
        const p = res.data;
        setCollectedAmount(p.collected_amount ?? null);
        setForm({
          title: p.title ?? "",
          title_en: p.title_en ?? "",
          slug: p.slug ?? "",
          category: p.category ?? "",
          category_en: p.category_en ?? "",
          short_description: p.short_description ?? "",
          short_description_en: p.short_description_en ?? "",
          description: p.description ?? "",
          description_en: p.description_en ?? "",
          benefits: p.benefits ?? "",
          benefits_en: p.benefits_en ?? "",
          target_amount: p.target_amount !== null && p.target_amount !== undefined ? String(p.target_amount) : "",
          deadline_days: p.deadline_days !== null && p.deadline_days !== undefined ? String(p.deadline_days) : "",
          thumbnail_path: p.thumbnail_path ?? "",
          banner_path: p.banner_path ?? "",
          is_highlight: Boolean(p.is_highlight),
          status: (String(p.status ?? "draft").toLowerCase() as any) ?? "draft",
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
  }, [mode, isEditIdValid, programId]);

  const uploadImage = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await http.post<{ path?: string; url?: string }>("/editor/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const path = String(res.data?.path ?? "").trim();
    if (!path) throw new Error("Upload gagal: path kosong.");
    return path;
  };

  const onUploadThumbnail = async (file: File) => {
    setThumbnailUploadError(null);
    setThumbnailUploading(true);
    try {
      const path = await uploadImage(file, "uploads/programs/thumbnails");
      setForm((s) => ({ ...s, thumbnail_path: path }));
    } catch (err: any) {
      setThumbnailUploadError(normalizeErrors(err).join(" "));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const onUploadBanner = async (file: File) => {
    setBannerUploadError(null);
    setBannerUploading(true);
    try {
      const path = await uploadImage(file, "uploads/programs/banners");
      setForm((s) => ({ ...s, banner_path: path }));
    } catch (err: any) {
      setBannerUploadError(normalizeErrors(err).join(" "));
    } finally {
      setBannerUploading(false);
    }
  };

  const payloadForRequest = (state: ProgramFormState) => {
    const targetAmount = state.target_amount.trim();
    const payload: any = {
      title: state.title.trim(),
      title_en: state.title_en.trim() || null,
      slug: state.slug.trim() || null,
      category: state.category.trim(),
      category_en: state.category_en.trim() || null,
      short_description: state.short_description.trim(),
      short_description_en: state.short_description_en.trim() || null,
      description: state.description.trim(),
      description_en: state.description_en.trim() || null,
      benefits: state.benefits.trim() || null,
      benefits_en: state.benefits_en.trim() || null,
      target_amount: targetAmount === "" ? null : Number(targetAmount),
      deadline_days: state.deadline_days.trim() === "" ? null : Number(state.deadline_days.trim()),
      thumbnail_path: state.thumbnail_path.trim() || null,
      banner_path: state.banner_path.trim() || null,
      is_highlight: state.is_highlight,
      status: state.status,
    };
    return payload;
  };

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID program tidak valid."]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const payload = payloadForRequest(form);
      if (mode === "create") {
        await http.post("/editor/programs", payload);
        toast.success("Program berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`/editor/programs/${programId}`, payload);
        toast.success("Perubahan program berhasil disimpan.", { title: "Berhasil" });
      }
      navigate("/editor/programs", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID program tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/editor/programs/${programId}`);
      toast.success("Program berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/programs", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Buat Program" : "Ubah Program";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
              Program
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Siapkan informasi program dengan deskripsi yang jelas dan target yang realistis."
                : "Perbarui detail program agar selalu rapi dan akurat."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/programs")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || thumbnailUploading || bannerUploading || deleting}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
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
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Periksa kembali:</p>
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
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Judul (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Judul program..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Title (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.title_en}
                  onChange={(e) => setForm((s) => ({ ...s, title_en: e.target.value }))}
                  placeholder="Program title (English)..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Ringkasan (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <textarea
                  value={form.short_description}
                  onChange={(e) => setForm((s) => ({ ...s, short_description: e.target.value }))}
                  rows={3}
                  placeholder="Ringkasan singkat untuk kartu program..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Short Description (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <textarea
                  value={form.short_description_en}
                  onChange={(e) => setForm((s) => ({ ...s, short_description_en: e.target.value }))}
                  rows={3}
                  placeholder="Short summary for program card (English)..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Deskripsi (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  rows={12}
                  placeholder="Jelaskan tujuan program, alur distribusi, dan informasi penting lainnya..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Description (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <textarea
                  value={form.description_en}
                  onChange={(e) => setForm((s) => ({ ...s, description_en: e.target.value }))}
                  rows={12}
                  placeholder="Explain program purpose, distribution flow, and other important information (English)..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Manfaat (Bahasa Indonesia) <span className="text-slate-400">(Optional)</span>
                </span>
                <textarea
                  value={form.benefits}
                  onChange={(e) => setForm((s) => ({ ...s, benefits: e.target.value }))}
                  rows={4}
                  placeholder="Tuliskan manfaat atau poin penting (boleh per baris)..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Benefits (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <textarea
                  value={form.benefits_en}
                  onChange={(e) => setForm((s) => ({ ...s, benefits_en: e.target.value }))}
                  rows={4}
                  placeholder="Write benefits or important points (one per line) (English)..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>
            </div>
          </div>

          {mode === "edit" && (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus program</h2>
              <p className="mt-2 text-sm text-slate-600">
                Program tidak bisa dihapus jika sudah memiliki donasi. Pastikan sebelum melanjutkan.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                  disabled={!canSubmit}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Program
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

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wide text-slate-400">Properti</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Status <span className="text-red-500">*</span>
                </span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                >
                  <option value="draft">Segera</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="archived">Arsip</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Kategori (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  placeholder="Mis. pendidikan"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Category (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.category_en}
                  onChange={(e) => setForm((s) => ({ ...s, category_en: e.target.value }))}
                  placeholder="e.g. education"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Slug
                  <span className="ml-2 font-normal text-slate-500">(opsional)</span>
                </span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                  placeholder="contoh: program-beasiswa"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Target Donasi (IDR) <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.target_amount}
                  onChange={(e) => setForm((s) => ({ ...s, target_amount: e.target.value }))}
                  placeholder="Mis. 25000000"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Batas Hari <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.deadline_days}
                  onChange={(e) => setForm((s) => ({ ...s, deadline_days: e.target.value }))}
                  placeholder="Mis. 30"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
                <p className="mt-2 text-xs font-semibold text-slate-500">Kosongkan jika program tidak memiliki batas hari.</p>
              </label>

              {mode === "edit" && collectedAmount !== null && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold tracking-wide text-slate-400">Terkumpul</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(collectedAmount)}</p>
                  <p className="mt-1 text-xs text-slate-500">Nilai ini dihitung dari donasi yang masuk.</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, is_highlight: !s.is_highlight }))}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                  form.is_highlight
                    ? "border-primary-100 bg-primary-50 text-primary-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                disabled={loading || saving || deleting}
              >
                <span>Highlight di landing</span>
                <span
                  className={[
                    "inline-flex h-6 w-11 items-center rounded-full p-1 transition",
                    form.is_highlight ? "bg-primary-600" : "bg-slate-200",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span
                    className={[
                      "h-4 w-4 rounded-full bg-white shadow-sm transition",
                      form.is_highlight ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wide text-slate-400">Media</p>

            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-wide text-slate-400">Thumbnail</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Foto program.</p>
                    <p className="mt-1 text-xs text-slate-500">jpg/png/webp, max 4MB.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Pilih Foto
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
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Tersimpan
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
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

                {thumbnailUploadError ? (
                  <p className="mt-3 text-sm font-semibold text-red-700">{thumbnailUploadError}</p>
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={thumbnailInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                    setThumbnailPreviewUrl(URL.createObjectURL(file));
                    void onUploadThumbnail(file);
                  }}
                  disabled={!canSubmit}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-wide text-slate-400">Banner</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Foto header program.</p>
                    <p className="mt-1 text-xs text-slate-500">jpg/png/webp, max 4MB.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Pilih Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
                      setBannerPreviewUrl(null);
                      setForm((s) => ({ ...s, banner_path: "" }));
                      setBannerUploadError(null);
                    }}
                    disabled={!canSubmit || (!bannerPreviewUrl && !form.banner_path)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hapus
                  </button>
                  {bannerUploading ? (
                    <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
                  ) : form.banner_path ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Tersimpan
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  {bannerPreviewUrl || savedBannerUrl ? (
                    <img
                      src={bannerPreviewUrl ?? savedBannerUrl ?? undefined}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm font-semibold text-slate-500">
                      Tidak ada pratinjau.
                    </div>
                  )}
                </div>

                {bannerUploadError ? (
                  <p className="mt-3 text-sm font-semibold text-red-700">{bannerUploadError}</p>
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={bannerInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
                    setBannerPreviewUrl(URL.createObjectURL(file));
                    void onUploadBanner(file);
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

export default EditorProgramForm;
