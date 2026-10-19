import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

// Components
import EditorBannerFormHeader from "../../../../components/management/editor/banner/form/EditorBannerFormHeader";
import EditorBannerFormMain from "../../../../components/management/editor/banner/form/EditorBannerFormMain";
import EditorBannerFormSidebar from "../../../../components/management/editor/banner/form/EditorBannerFormSidebar";

// Types
import { 
  type Banner, 
  type BannerFormState, 
  type BannerMediaType,
  emptyBannerForm, 
  bannerFolder,
  bannerVideoFolder,
  getNextBannerOrder 
} from "../../../../components/management/editor/banner/EditorBannerTypes";

export default function EditorBannerCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<BannerFormState>(emptyBannerForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [peers, setPeers] = useState<Banner[]>([]);
  const [loadingPeers, setLoadingPeers] = useState(true);
  const [orderTouched, setOrderTouched] = useState(false);

  // Image Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Video Upload State
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const orderNumber = Number(form.display_order);
  const orderIsValid = Number.isFinite(orderNumber) && Number.isInteger(orderNumber) && orderNumber >= 0;
  
  const duplicateOrderOwner = useMemo(() => {
    if (!orderIsValid) return null;
    return peers.find((b) => b.display_order === orderNumber) ?? null;
  }, [orderIsValid, orderNumber, peers]);

  const orderErrorMsg = useMemo(() => {
    if (!orderIsValid) return "Urutan harus berupa angka bulat positif.";
    if (duplicateOrderOwner) return `Urutan #${orderNumber} sudah digunakan banner lain.`;
    return null;
  }, [duplicateOrderOwner, orderIsValid, orderNumber]);

  const suggestedOrder = useMemo(() => getNextBannerOrder(peers), [peers]);

  useEffect(() => {
    http.get<Banner[]>("/editor/banners")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPeers(list);
        if (!orderTouched) {
          const next = getNextBannerOrder(list);
          setForm(s => ({ ...s, display_order: String(next) }));
        }
      })
      .finally(() => setLoadingPeers(false));
  }, [orderTouched]);

  const onUploadImage = async (file: File) => {
    setImageError(null);
    setImageUploading(true);
    try {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", bannerFolder);
      const res = await http.post<{ path: string }>("/editor/uploads/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(s => ({ ...s, image_path: res.data.path }));
      toast.success("Gambar berhasil diunggah.", { title: "Berhasil" });
    } catch {
      setImageError("Gagal mengunggah gambar.");
    } finally {
      setImageUploading(false);
    }
  };

  const onUploadVideo = async (file: File) => {
    setVideoError(null);
    setVideoUploading(true);
    try {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", bannerVideoFolder);
      const res = await http.post<{ path: string; url?: string }>("/editor/uploads/video", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(s => ({ ...s, video_path: res.data.path }));
      toast.success("Video berhasil diunggah.", { title: "Berhasil" });
    } catch {
      setVideoError("Gagal mengunggah video. Pastikan format didukung dan ukuran tidak melebihi batas.");
    } finally {
      setVideoUploading(false);
    }
  };

  const onSubmit = async () => {
    if (form.media_type === "image" && !form.image_path) {
      setErrors(["Gambar banner wajib diunggah."]);
      return;
    }
    if (form.media_type === "video" && !form.video_path) {
      setErrors(["File video banner wajib diunggah."]);
      return;
    }
    if (orderErrorMsg) {
      setErrors([orderErrorMsg]);
      return;
    }

    if (form.video_duration.trim()) {
      const dur = Number(form.video_duration);
      if (isNaN(dur) || dur < 1 || dur > 120) {
        setErrors(["Durasi video harus antara 1 sampai 120 detik."]);
        return;
      }
    }

    setSaving(true);
    setErrors([]);
    try {
      await http.post("/editor/banners", {
        media_type: form.media_type,
        image_path: form.image_path.trim() || null,
        video_path: form.video_path.trim() || null,
        video_duration: form.video_duration.trim() ? Number(form.video_duration) : null,
        display_order: orderNumber,
        status: form.status,
      });
      toast.success("Banner berhasil dibuat.", { title: "Berhasil" });
      navigate("/editor/banners", { replace: true });
    } catch (err: unknown) {
      if (isAxiosError<{ message?: string; errors?: Record<string, unknown> }>(err)) {
        const errs = err.response?.data?.errors;
        if (errs && typeof errs === "object") {
          const msgs = Object.values(errs).flat().map(String);
          setErrors(msgs.length ? msgs : ["Validasi gagal."]);
        } else {
          const msg = err.response?.data?.message ?? "Gagal membuat banner.";
          setErrors([msg]);
        }
      } else {
        setErrors(["Gagal membuat banner."]);
      }
    } finally {
      setSaving(false);
    }
  };

  const isVideo = form.media_type === "video";
  const hasRequiredMedia = isVideo ? !!form.video_path : !!form.image_path;
  const isMediaUploading = imageUploading || videoUploading;
  const canSubmit = !saving && !isMediaUploading && !loadingPeers && !orderErrorMsg && hasRequiredMedia;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-20">
      <EditorBannerFormHeader
        mode="create"
        saving={saving}
        uploading={isMediaUploading}
        deleting={false}
        canSubmit={!!canSubmit}
        onBack={() => navigate("/editor/banners")}
        onSubmit={onSubmit}
      />

      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-in fade-in slide-in-from-top-2">
          {errors.map((err, i) => <p key={i}>{err}</p>)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <EditorBannerFormMain
            form={form}
            onMediaTypeChange={(type: BannerMediaType) => setForm(s => ({ ...s, media_type: type }))}
            onUploadImage={onUploadImage}
            onRemoveImage={() => {
              setForm(s => ({ ...s, image_path: "" }));
              if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
              setImagePreviewUrl(null);
            }}
            imageUploading={imageUploading}
            imageError={imageError}
            imagePreviewUrl={imagePreviewUrl}
            onUploadVideo={onUploadVideo}
            onRemoveVideo={() => {
              setForm(s => ({ ...s, video_path: "" }));
              if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
              setVideoPreviewUrl(null);
            }}
            videoUploading={videoUploading}
            videoError={videoError}
            videoPreviewUrl={videoPreviewUrl}
            onVideoDurationDetected={(dur) => {
              setForm(s => {
                if (!s.video_duration) {
                  return { ...s, video_duration: String(Math.min(120, dur)) };
                }
                return s;
              });
            }}
            disabled={saving}
          />
        </div>
        <div className="lg:col-span-4">
          <EditorBannerFormSidebar
            form={form}
            onChange={(val) => {
              setOrderTouched(true);
              setForm(s => ({ ...s, display_order: val }));
            }}
            onDurationChange={(val) => setForm(s => ({ ...s, video_duration: val }))}
            onStatusChange={(status) => setForm(s => ({ ...s, status }))}
            onSuggest={() => {
               setOrderTouched(true);
               setForm(s => ({ ...s, display_order: String(suggestedOrder) }));
            }}
            suggestedOrder={suggestedOrder}
            loadingPeers={loadingPeers}
            disabled={saving}
            error={orderErrorMsg}
          />
        </div>
      </div>
    </div>
  );
}
