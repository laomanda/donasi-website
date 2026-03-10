import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import {
  type Partner,
  type PartnerFormState,
  emptyPartnerForm,
  partnerFolder,
} from "../../../../components/management/editor/partner/EditorPartnerTypes";

import EditorPartnerFormHeader from "../../../../components/management/editor/partner/form/EditorPartnerFormHeader";
import EditorPartnerFormMain from "../../../../components/management/editor/partner/form/EditorPartnerFormMain";
import EditorPartnerFormSidebar from "../../../../components/management/editor/partner/form/EditorPartnerFormSidebar";

export default function EditorPartnerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<PartnerFormState>(emptyPartnerForm);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPartner() {
      try {
        const res = await http.get<Partner[]>("/editor/partners");
        const list = Array.isArray(res.data) ? res.data : [];
        const partnerId = Number(id);
        const data = list.find((p) => p.id === partnerId);
        
        if (!data) {
          setError("Gagal memuat data mitra. Mungkin mitra tidak ditemukan.");
          return;
        }

        setPartner(data);
        setForm({
          name: data.name || "",
          url: data.url || "",
          description: data.description || "",
          logo_path: data.logo_path || null,
          is_active: data.is_active ?? true,
          order: String(data.order ?? 0),
        });
      } catch (err: any) {
        console.error("Gagal memuat mitra:", err);
        setError("Gagal memuat data mitra. Terjadi kesalahan pada server.");
      } finally {
        setLoading(false);
      }
    }
    if (id) void loadPartner();
  }, [id]);

  const handleChange = (updates: Partial<PartnerFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || (!form.logo_path && !partner?.logo_path)) {
      setError("Nama dan logo mitra wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let finalLogoPath = form.logo_path as string;

      if (form.logo_path instanceof File) {
        const uploadData = new FormData();
        uploadData.append("file", form.logo_path);
        uploadData.append("folder", partnerFolder);
        const res = await http.post<{ path: string }>("/editor/uploads/image", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalLogoPath = res.data.path;
      }

      await http.put(`/editor/partners/${id}`, {
        name: form.name.trim(),
        is_active: form.is_active ? 1 : 0,
        order: Number(form.order) || 0,
        url: form.url?.trim() || null,
        description: form.description?.trim() || null,
        logo_path: finalLogoPath || partner?.logo_path,
      });

      toast.success("Mitra berhasil diperbarui.", { title: "Berhasil" });
      navigate("/editor/partners");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan mitra.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!partner) return;
    setDeleting(true);
    setError(null);
    try {
      await http.delete(`/editor/partners/${partner.id}`);
      toast.success("Mitra berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/partners");
    } catch (err: any) {
      console.error(err);
      setError("Gagal menghapus mitra.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="font-semibold text-slate-500 animate-pulse">Memuat data mitra...</p>
      </div>
    );
  }

  const isFormValid = Boolean(form.name.trim() && (form.logo_path || form._previewUrl));
  const isBusy = saving || deleting;

  return (
    <div className="space-y-6 pb-20">
      <EditorPartnerFormHeader
        mode="edit"
        saving={saving}
        deleting={deleting}
        canSubmit={isFormValid}
        onSubmit={handleSubmit}
        onBack={() => navigate("/editor/partners")}
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EditorPartnerFormMain 
            form={form} 
            onChange={handleChange} 
            disabled={isBusy} 
            mode="edit" 
            onDelete={handleDelete}
            deleting={deleting}
          />
        </div>
        <div className="lg:col-span-1">
          <EditorPartnerFormSidebar form={form} onChange={handleChange} disabled={isBusy} />
        </div>
      </div>
    </div>
  );
}
