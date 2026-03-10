import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import {
  type Partner,
  type PartnerFormState,
  emptyPartnerForm,
  getNextAvailableOrder,
  partnerFolder,
} from "../../../../components/management/editor/partner/EditorPartnerTypes";

import EditorPartnerFormHeader from "../../../../components/management/editor/partner/form/EditorPartnerFormHeader";
import EditorPartnerFormMain from "../../../../components/management/editor/partner/form/EditorPartnerFormMain";
import EditorPartnerFormSidebar from "../../../../components/management/editor/partner/form/EditorPartnerFormSidebar";

export default function EditorPartnerCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<PartnerFormState>(emptyPartnerForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial order logic
  useEffect(() => {
    async function initOrder() {
      try {
        const res = await http.get<Partner[]>("/editor/partners");
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          const nextOrder = getNextAvailableOrder(list);
          setForm((prev) => ({ ...prev, order: String(nextOrder) }));
        }
      } catch (err) {
        console.error("Gagal memuat auto-order:", err);
      }
    }
    void initOrder();
  }, []);

  const handleChange = (updates: Partial<PartnerFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.logo_path) {
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

      await http.post("/editor/partners", {
        name: form.name.trim(),
        is_active: form.is_active ? 1 : 0,
        order: Number(form.order) || 0,
        url: form.url?.trim() || null,
        description: form.description?.trim() || null,
        logo_path: finalLogoPath,
      });

      toast.success("Mitra berhasil ditambahkan.", { title: "Berhasil" });
      navigate("/editor/partners");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan mitra.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(form.name.trim() && form.logo_path);

  return (
    <div className="space-y-6 pb-20">
      <EditorPartnerFormHeader
        mode="create"
        saving={saving}
        deleting={false}
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
          <EditorPartnerFormMain form={form} onChange={handleChange} disabled={saving} mode="create" />
        </div>
        <div className="lg:col-span-1">
          <EditorPartnerFormSidebar form={form} onChange={handleChange} disabled={saving} />
        </div>
      </div>
    </div>
  );
}
