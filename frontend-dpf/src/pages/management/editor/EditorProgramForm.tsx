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
    published_at?: string | null;
    thumbnail_path?: string | null;
    banner_path?: string | null;
    program_images?: string[] | null;
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
    published_at: string;
    thumbnail_path: string;
    banner_path: string;
    program_images: string[];
    is_highlight: boolean;
    status: "draft" | "active" | "completed";
};

const gallerySlots = 3;

const normalizeProgramImages = (images?: string[] | null) => {
    const list = Array.isArray(images) ? images : [];
    const cleaned = list.map((value) => String(value ?? "").trim()).filter(Boolean);
    while (cleaned.length < gallerySlots) cleaned.push("");
    return cleaned.slice(0, gallerySlots);
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
    published_at: "",
    thumbnail_path: "",
    banner_path: "",
    program_images: normalizeProgramImages([]),
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

const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
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
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [categoryPick, setCategoryPick] = useState("");
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const shortDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
    const shortDescriptionEnRef = useRef<HTMLTextAreaElement | null>(null);
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
    const descriptionEnRef = useRef<HTMLTextAreaElement | null>(null);
    const benefitsRef = useRef<HTMLTextAreaElement | null>(null);
    const benefitsEnRef = useRef<HTMLTextAreaElement | null>(null);

    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
    const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

    const [bannerUploading, setBannerUploading] = useState(false);
    const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    const [galleryUploading, setGalleryUploading] = useState<boolean[]>(
        () => Array.from({ length: gallerySlots }, () => false)
    );
    const [galleryUploadErrors, setGalleryUploadErrors] = useState<string[]>(
        () => Array.from({ length: gallerySlots }, () => "")
    );
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<Array<string | null>>(
        () => Array.from({ length: gallerySlots }, () => null)
    );
    const galleryInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [collectedAmount, setCollectedAmount] = useState<number | string | null>(null);

    const isGalleryUploading = galleryUploading.some(Boolean);
    const isEditIdValid = typeof programId === "number" && Number.isFinite(programId) && programId > 0;
    const canSubmit =
        (mode === "create" || isEditIdValid) &&
        !loading &&
        !saving &&
        !thumbnailUploading &&
        !bannerUploading &&
        !isGalleryUploading &&
        !deleting;

    const savedThumbnailUrl = useMemo(() => resolveStorageUrl(form.thumbnail_path), [form.thumbnail_path]);
    const savedBannerUrl = useMemo(() => resolveStorageUrl(form.banner_path), [form.banner_path]);

    useEffect(() => {
        return () => {
            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
            if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
            galleryPreviewUrls.forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [thumbnailPreviewUrl, bannerPreviewUrl, galleryPreviewUrls]);

    useEffect(() => {
        autoResizeTextarea(shortDescriptionRef.current);
    }, [form.short_description]);

    useEffect(() => {
        autoResizeTextarea(shortDescriptionEnRef.current);
    }, [form.short_description_en]);

    useEffect(() => {
        autoResizeTextarea(descriptionRef.current);
    }, [form.description]);

    useEffect(() => {
        autoResizeTextarea(descriptionEnRef.current);
    }, [form.description_en]);

    useEffect(() => {
        autoResizeTextarea(benefitsRef.current);
    }, [form.benefits]);

    useEffect(() => {
        autoResizeTextarea(benefitsEnRef.current);
    }, [form.benefits_en]);

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
                    published_at: p.published_at ?? "",
                    thumbnail_path: p.thumbnail_path ?? "",
                    banner_path: p.banner_path ?? "",
                    program_images: normalizeProgramImages(p.program_images ?? []),
                    is_highlight: Boolean(p.is_highlight),
                    status: (String(p.status ?? "draft").toLowerCase() === "archived" ? "completed" : String(p.status ?? "draft").toLowerCase()) as any,
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

    const onUploadGallery = async (index: number, file: File) => {
        setGalleryUploadErrors((prev) => {
            const next = [...prev];
            next[index] = "";
            return next;
        });
        setGalleryUploading((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        try {
            const path = await uploadImage(file, "uploads/programs/gallery");
            setForm((s) => {
                const nextImages = [...s.program_images];
                nextImages[index] = path;
                return { ...s, program_images: nextImages };
            });
        } catch (err: any) {
            setGalleryUploadErrors((prev) => {
                const next = [...prev];
                next[index] = normalizeErrors(err).join(" ");
                return next;
            });
        } finally {
            setGalleryUploading((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    useEffect(() => {
        http
            .get("/editor/programs", { params: { per_page: 200 } })
            .then((res) => {
                const items = Array.isArray(res.data?.data) ? res.data.data : [];
                const map = new Map<string, string>();
                items.forEach((program: any) => {
                    const raw = String(program?.category ?? "").trim();
                    if (!raw) return;
                    const key = raw.toLowerCase();
                    if (!map.has(key)) map.set(key, raw);
                });
                setCategoryOptions(Array.from(map.values()).sort((a, b) => a.localeCompare(b)));
            })
            .catch(() => undefined);
    }, []);

    const payloadForRequest = (state: ProgramFormState) => {
        const targetAmount = state.target_amount.trim();
        const normalizedCategory = (() => {
            const raw = state.category.trim();
            if (!raw) return raw;
            const match = categoryOptions.find((opt) => opt.toLowerCase() === raw.toLowerCase());
            return match ?? raw;
        })();
        const payload: any = {
            title: state.title.trim(),
            title_en: state.title_en.trim() || null,
            slug: state.slug.trim() || null,
            category: normalizedCategory,
            category_en: state.category_en.trim() || null,
            short_description: state.short_description.trim(),
            short_description_en: state.short_description_en.trim() || null,
            description: state.description.trim(),
            description_en: state.description_en.trim() || null,
            benefits: state.benefits.trim() || null,
            benefits_en: state.benefits_en.trim() || null,
            target_amount: targetAmount === "" ? null : Number(targetAmount),
            deadline_days: state.deadline_days.trim() === "" ? null : Number(state.deadline_days.trim()),
            published_at: state.published_at.trim() || null,
            thumbnail_path: state.thumbnail_path.trim() || null,
            banner_path: state.banner_path.trim() || null,
            program_images: state.program_images.map((value) => value.trim()).filter(Boolean).slice(0, gallerySlots),
            is_highlight: state.is_highlight,
            status: state.status,
        };
        if (payload.program_images.length === 0) payload.program_images = null;
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
            <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                            <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
                            Program
                        </span>
                        <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            {mode === "create"
                                ? "Susun informasi program dengan deskripsi yang jelas dan target yang terukur."
                                : "Perbarui detail program agar tetap rapi dan akurat."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/editor/programs")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                                    placeholder="Tulis judul program yang jelas."
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
                                    placeholder="Terjemahan judul program (opsional)."
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Ringkasan (Bahasa Indonesia) <span className="text-red-500">*</span>
                                </span>
                                <textarea
                                    value={form.short_description}
                                    onChange={(e) => setForm((s) => ({ ...s, short_description: e.target.value }))}
                                    rows={3}
                                    placeholder="Ringkasan singkat yang tampil di kartu program."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={shortDescriptionRef}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Ringkasan (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                                </span>
                                <textarea
                                    value={form.short_description_en}
                                    onChange={(e) => setForm((s) => ({ ...s, short_description_en: e.target.value }))}
                                    rows={3}
                                    placeholder="Terjemahan ringkasan (opsional)."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={shortDescriptionEnRef}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Deskripsi (Bahasa Indonesia) <span className="text-red-500">*</span>
                                </span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                                    rows={12}
                                    placeholder="Jelaskan tujuan program, alur penyaluran, dan informasi penting lainnya."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={descriptionRef}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Deskripsi (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                                </span>
                                <textarea
                                    value={form.description_en}
                                    onChange={(e) => setForm((s) => ({ ...s, description_en: e.target.value }))}
                                    rows={12}
                                    placeholder="Terjemahan deskripsi program (opsional)."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={descriptionEnRef}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Manfaat (Bahasa Indonesia) <span className="text-slate-400">(opsional)</span>
                                </span>
                                <textarea
                                    value={form.benefits}
                                    onChange={(e) => setForm((s) => ({ ...s, benefits: e.target.value }))}
                                    rows={4}
                                    placeholder="Tuliskan manfaat utama, boleh per baris."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={benefitsRef}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Manfaat (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                                </span>
                                <textarea
                                    value={form.benefits_en}
                                    onChange={(e) => setForm((s) => ({ ...s, benefits_en: e.target.value }))}
                                    rows={4}
                                    placeholder="Terjemahan manfaat (opsional)."
                                    className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                    ref={benefitsEnRef}
                                />
                            </label>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Galeri Program</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700">Maksimal 3 gambar untuk galeri.</p>
                                        <p className="mt-1 text-xs text-slate-500">Urutan gambar tampil di detail program untuk transparansi.</p>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        <FontAwesomeIcon icon={faImage} />
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                    {form.program_images.map((path, index) => {
                                        const previewUrl = galleryPreviewUrls[index];
                                        const savedUrl = resolveStorageUrl(path);
                                        const hasImage = Boolean(previewUrl || savedUrl);
                                        return (
                                            <div
                                                key={index}
                                                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                                            >
                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                                    Gambar {index + 1}
                                                </p>
                                                <div className="mt-3 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                                                    {hasImage ? (
                                                        <img
                                                            src={previewUrl ?? savedUrl ?? undefined}
                                                            alt=""
                                                            className="h-32 w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-32 items-center justify-center text-xs font-semibold text-slate-500">
                                                            Belum ada gambar.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => galleryInputRefs.current[index]?.click()}
                                                        disabled={!canSubmit}
                                                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                                    >
                                                        Pilih
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (previewUrl) URL.revokeObjectURL(previewUrl);
                                                            setGalleryPreviewUrls((prev) => {
                                                                const next = [...prev];
                                                                next[index] = null;
                                                                return next;
                                                            });
                                                            setGalleryUploadErrors((prev) => {
                                                                const next = [...prev];
                                                                next[index] = "";
                                                                return next;
                                                            });
                                                            setForm((s) => {
                                                                const nextImages = [...s.program_images];
                                                                nextImages[index] = "";
                                                                return { ...s, program_images: nextImages };
                                                            });
                                                        }}
                                                        disabled={!canSubmit || !hasImage}
                                                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>

                                                {galleryUploading[index] ? (
                                                    <p className="mt-2 text-xs font-semibold text-slate-600">Mengunggah...</p>
                                                ) : null}
                                                {galleryUploadErrors[index] ? (
                                                    <p className="mt-2 text-xs font-semibold text-red-700">{galleryUploadErrors[index]}</p>
                                                ) : null}

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    aria-label={`Unggah gambar galeri ${index + 1}`}
                                                    ref={(el) => {
                                                        galleryInputRefs.current[index] = el;
                                                    }}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        const nextPreview = URL.createObjectURL(file);
                                                        setGalleryPreviewUrls((prev) => {
                                                            const next = [...prev];
                                                            if (next[index]) URL.revokeObjectURL(next[index] as string);
                                                            next[index] = nextPreview;
                                                            return next;
                                                        });
                                                        void onUploadGallery(index, file);
                                                    }}
                                                    disabled={!canSubmit}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                >
                                    <option value="draft">Draf</option>
                                    <option value="active">Berjalan</option>
                                    <option value="completed">Tersalurkan</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Kategori (Bahasa Indonesia) <span className="text-red-500">*</span>
                                </span>
                                <input
                                    value={form.category}
                                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                                    onBlur={() => {
                                        const raw = form.category.trim();
                                        if (!raw) return;
                                        const match = categoryOptions.find((opt) => opt.toLowerCase() === raw.toLowerCase());
                                        if (match && match !== form.category) {
                                            setForm((s) => ({ ...s, category: match }));
                                        }
                                    }}
                                    placeholder="Contoh: Pendidikan"
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                                <select
                                    value={categoryPick}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value) return;
                                        setForm((s) => ({ ...s, category: value }));
                                        setCategoryPick("");
                                    }}
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400 disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={loading || saving || deleting || categoryOptions.length === 0}
                                >
                                    <option value="">Pilih kategori yang sudah ada</option>
                                    {categoryOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Kategori (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                                </span>
                                <input
                                    value={form.category_en}
                                    onChange={(e) => setForm((s) => ({ ...s, category_en: e.target.value }))}
                                    placeholder="Contoh: education"
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
                                    placeholder="Contoh: program-beasiswa-santri"
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Target Donasi (IDR) <span className="text-red-500">*</span>
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={form.target_amount}
                                    onChange={(e) => setForm((s) => ({ ...s, target_amount: e.target.value }))}
                                    placeholder="Contoh: 25000000"
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Batas Hari <span className="text-slate-400">(opsional)</span>
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.deadline_days}
                                    onChange={(e) => setForm((s) => ({ ...s, deadline_days: e.target.value }))}
                                    placeholder="Contoh: 30"
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                                <p className="mt-2 text-xs font-semibold text-slate-500">Kosongkan jika program tidak memiliki batas waktu.</p>
                            </label>

                            <label className="block">
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Tanggal Publikasi <span className="text-slate-400">(opsional)</span>
                                </span>
                                <input
                                    type="date"
                                    value={form.published_at}
                                    onChange={(e) => setForm((s) => ({ ...s, published_at: e.target.value }))}
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                    disabled={loading || saving || deleting}
                                />
                                <p className="mt-2 text-xs font-semibold text-slate-500">Kosongkan jika jadwal publikasi belum ditentukan.</p>
                            </label>

                            {mode === "edit" && collectedAmount !== null && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Terkumpul</p>
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
                                        ? "border-brandGreen-200 bg-brandGreen-50 text-brandGreen-800"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                                ].join(" ")}
                                disabled={loading || saving || deleting}
                            >
                                <span>Tampilkan di beranda</span>
                                <span
                                    className={[
                                        "inline-flex h-6 w-11 items-center rounded-full p-1 transition",
                                        form.is_highlight ? "bg-brandGreen-600" : "bg-slate-200",
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
                            <div className="pt-6 border-t border-slate-200">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Media</p>

                                <div className="mt-4 space-y-5">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Gambar Utama</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-700">Gambar utama program.</p>
                                                <p className="mt-1 text-xs text-slate-500">jpg/png/webp, maks. 4MB.</p>
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
                                            aria-label="Unggah gambar utama"
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
                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Gambar Header</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-700">Gambar header program.</p>
                                                <p className="mt-1 text-xs text-slate-500">jpg/png/webp, maks. 4MB.</p>
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
                                                Pilih Gambar
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
                                            aria-label="Unggah gambar header"
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
            </div>
        </div>
    );
}
export default EditorProgramForm;
