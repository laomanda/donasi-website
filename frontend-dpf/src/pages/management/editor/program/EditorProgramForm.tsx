import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

// Types
import type { EditorProgram, ProgramFormState, FormMode } from "../../../../components/management/editor/program/EditorProgramTypes";

// Shared Logic & UI
import { normalizeErrors } from "../../../../components/management/editor/program/EditorProgramUtils";
import { LoadingSkeleton } from "../../../../components/management/editor/program/EditorProgramUI";

// Sub-components
import EditorProgramFormHeader from "../../../../components/management/editor/program/form/EditorProgramFormHeader";
import EditorProgramFormMain from "../../../../components/management/editor/program/form/EditorProgramFormMain";
import EditorProgramFormSidebar from "../../../../components/management/editor/program/form/EditorProgramFormSidebar";
import EditorProgramFormMedia from "../../../../components/management/editor/program/form/EditorProgramFormMedia";
import EditorProgramDangerZone from "../../../../components/management/editor/program/form/EditorProgramDangerZone";

type Props = {
    mode: FormMode;
    programId?: number;
};

const gallerySlots = 3;

const normalizeProgramImages = (images?: string[] | null) => {
    const list = Array.isArray(images) ? images : [];
    const cleaned = list.map((value) => String(value ?? "").trim()).filter(Boolean);
    while (cleaned.length < gallerySlots) cleaned.push("");
    return cleaned.slice(0, gallerySlots);
};

export default function EditorProgramForm({ mode, programId }: Props) {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState<ProgramFormState>({
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
        thumbnail_path: "",
        banner_path: "",
        program_images: normalizeProgramImages([]),
        status: "draft",
        is_highlight: false,
        target_amount: "",
        deadline_days: "",
        published_at: "",
    });

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ category: string; category_en: string | null }[]>([]);
    const [deleting, setDeleting] = useState(false);

    // Image Upload States
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState<boolean[]>(Array(gallerySlots).fill(false));

    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<(string | null)[]>(Array(gallerySlots).fill(null));

    const [thumbnailError, setThumbnailError] = useState<string | null>(null);
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [galleryErrors, setGalleryErrors] = useState<string[]>(Array(gallerySlots).fill(""));

    const isEditIdValid = typeof programId === "number" && Number.isFinite(programId) && programId > 0;

    useEffect(() => {
        http.get<{ category: string; category_en: string | null }[]>("/editor/programs/categories").then((res) => {
            setAvailableCategories(res.data ?? []);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (mode === "edit" && isEditIdValid) {
            setLoading(true);
            setErrors([]);
            http.get<EditorProgram>(`/editor/programs/${programId}`)
                .then((res) => {
                    const d = res.data;
                    setForm({
                        title: d.title || "",
                        title_en: d.title_en || "",
                        slug: d.slug || "",
                        category: d.category || "",
                        category_en: d.category_en || "",
                        short_description: d.short_description || "",
                        short_description_en: d.short_description_en || "",
                        description: d.description || "",
                        description_en: d.description_en || "",
                        benefits: d.benefits || "",
                        benefits_en: d.benefits_en || "",
                        thumbnail_path: d.thumbnail_path || "",
                        banner_path: d.banner_path || "",
                        program_images: normalizeProgramImages(d.program_images),
                        status: (String(d.status ?? "draft").toLowerCase() === "archived" ? "completed" : String(d.status ?? "draft").toLowerCase()) as any,
                        is_highlight: Boolean(d.is_highlight),
                        target_amount: d.target_amount !== null && d.target_amount !== undefined ? String(d.target_amount) : "",
                        deadline_days: d.deadline_days !== null && d.deadline_days !== undefined ? String(d.deadline_days) : "",
                        published_at: d.published_at || "",
                    });
                })
                .catch((err) => setErrors(normalizeErrors(err)))
                .finally(() => setLoading(false));
        }
    }, [mode, programId, isEditIdValid]);

    const updateForm = (updates: Partial<ProgramFormState>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const uploadImage = async (file: File, folder: string) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        const res = await http.post<{ path: string }>("/editor/uploads/image", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.path;
    };

    const onUploadThumbnail = async (file: File) => {
        setThumbnailUploading(true);
        setThumbnailError(null);
        try {
            const path = await uploadImage(file, "uploads/programs/thumbnails");
            updateForm({ thumbnail_path: path });
            setThumbnailPreviewUrl(URL.createObjectURL(file));
            toast.success("Thumbnail berhasil diunggah.", { title: "Berhasil" });
        } catch (err: any) {
            setThumbnailError(normalizeErrors(err).join(" "));
        } finally {
            setThumbnailUploading(false);
        }
    };

    const onUploadBanner = async (file: File) => {
        setBannerUploading(true);
        setBannerError(null);
        try {
            const path = await uploadImage(file, "uploads/programs/banners");
            updateForm({ banner_path: path });
            setBannerPreviewUrl(URL.createObjectURL(file));
            toast.success("Banner berhasil diunggah.", { title: "Berhasil" });
        } catch (err: any) {
            setBannerError(normalizeErrors(err).join(" "));
        } finally {
            setBannerUploading(false);
        }
    };

    const onUploadGallery = async (index: number, file: File) => {
        setGalleryUploading(prev => prev.map((v, i) => i === index ? true : v));
        setGalleryErrors(prev => prev.map((v, i) => i === index ? "" : v));
        try {
            const path = await uploadImage(file, "uploads/programs/gallery");
            const newImages = [...form.program_images];
            newImages[index] = path;
            updateForm({ program_images: newImages });
            setGalleryPreviewUrls(prev => prev.map((v, i) => i === index ? URL.createObjectURL(file) : v));
            toast.success(`Gambar ${index + 1} berhasil diunggah.`, { title: "Berhasil" });
        } catch (err: any) {
            setGalleryErrors(prev => prev.map((v, i) => i === index ? normalizeErrors(err).join(" ") : v));
        } finally {
            setGalleryUploading(prev => prev.map((v, i) => i === index ? false : v));
        }
    };

    const onRemoveGallery = (index: number) => {
        const newImages = [...form.program_images];
        newImages[index] = "";
        updateForm({ program_images: newImages });
        
        setGalleryPreviewUrls(prev => {
            const next = [...prev];
            if (next[index]) URL.revokeObjectURL(next[index]!);
            next[index] = null;
            return next;
        });

        setGalleryErrors(prev => {
            const next = [...prev];
            next[index] = "";
            return next;
        });
    };

    const payloadForRequest = (state: ProgramFormState) => {
        const targetAmount = String(state.target_amount).trim();
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
            deadline_days: String(state.deadline_days).trim() === "" ? null : Number(String(state.deadline_days).trim()),
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
        setErrors([]);
        setSaving(true);
        try {
            const payload = payloadForRequest(form);
            if (mode === "create") {
                await http.post("/editor/programs", payload);
                toast.success("Program berhasil dibuat.", { title: "Berhasil" });
            } else {
                await http.put(`/editor/programs/${programId}`, payload);
                toast.success("Program berhasil diperbarui.", { title: "Berhasil" });
            }
            navigate("/editor/programs", { replace: true });
        } catch (err: any) {
            setErrors(normalizeErrors(err));
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (mode !== "edit" || !isEditIdValid) return;
        setDeleting(true);
        setErrors([]);
        try {
            await http.delete(`/editor/programs/${programId}`);
            toast.success("Program berhasil dihapus.", { title: "Berhasil" });
            navigate("/editor/programs", { replace: true });
        } catch (err: any) {
            setErrors(normalizeErrors(err));
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setDeleting(false);
        }
    };

    const canSubmit = !saving && !thumbnailUploading && !bannerUploading && !galleryUploading.some(v => v) && !deleting;

    if (loading) return <div className="p-10"><LoadingSkeleton rows={10} /></div>;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
            <EditorProgramFormHeader
                mode={mode}
                saving={saving}
                uploading={thumbnailUploading || bannerUploading || galleryUploading.some(v => v)}
                deleting={deleting}
                canSubmit={canSubmit}
                onSubmit={onSubmit}
            />

            {errors.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                    <p className="font-bold">Periksa kembali data berikut:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        {errors.slice(0, 8).map((msg, idx) => (
                            <li key={idx} className="font-semibold">{msg}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    <EditorProgramFormMain
                        form={form}
                        onChange={updateForm}
                        disabled={saving || deleting}
                    />

                    <EditorProgramFormMedia
                        form={form}
                        onChange={updateForm}
                        onUploadThumbnail={onUploadThumbnail}
                        onUploadBanner={onUploadBanner}
                        onUploadGallery={onUploadGallery}
                        onRemoveGallery={onRemoveGallery}
                        thumbnailUploading={thumbnailUploading}
                        bannerUploading={bannerUploading}
                        galleryUploading={galleryUploading}
                        thumbnailPreviewUrl={thumbnailPreviewUrl}
                        bannerPreviewUrl={bannerPreviewUrl}
                        galleryPreviewUrls={galleryPreviewUrls}
                        thumbnailError={thumbnailError}
                        bannerError={bannerError}
                        galleryErrors={galleryErrors}
                        canSubmit={canSubmit}
                    />

                    {mode === "edit" && (
                        <EditorProgramDangerZone
                            onDelete={onDelete}
                            deleting={deleting}
                            disabled={!canSubmit}
                        />
                    )}
                </div>

                <div className="lg:col-span-4">
                    <EditorProgramFormSidebar
                        form={form}
                        onChange={updateForm}
                        availableCategories={availableCategories}
                        loading={loading}
                        saving={saving}
                        deleting={deleting}
                    />
                </div>
            </div>
        </div>
    );
}
