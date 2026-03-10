import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  emptyBannerForm, 
  bannerFolder,
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

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

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

  const onSubmit = async () => {
    if (!form.image_path) {
      setErrors(["Gambar banner wajib diisi."]);
      return;
    }
    if (orderErrorMsg) {
      setErrors([orderErrorMsg]);
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      await http.post("/editor/banners", {
        image_path: form.image_path,
        display_order: orderNumber
      });
      toast.success("Banner berhasil dibuat.", { title: "Berhasil" });
      navigate("/editor/banners", { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Gagal membuat banner.";
      setErrors([msg]);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = !saving && !imageUploading && !loadingPeers && !orderErrorMsg && form.image_path;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-20">
      <EditorBannerFormHeader
        mode="create"
        saving={saving}
        uploading={imageUploading}
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
            onUpload={onUploadImage}
            onRemove={() => {
              setForm(s => ({ ...s, image_path: "" }));
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }}
            uploading={imageUploading}
            uploadError={imageError}
            previewUrl={previewUrl}
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
