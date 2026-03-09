import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import {
  type Tag,
  type TagFormState,
  emptyTagForm,
  getNextAvailableOrder,
} from "../../../../components/management/editor/tag/EditorTagTypes";

import EditorTagFormHeader from "../../../../components/management/editor/tag/form/EditorTagFormHeader";
import EditorTagFormMain from "../../../../components/management/editor/tag/form/EditorTagFormMain";
import EditorTagFormSidebar from "../../../../components/management/editor/tag/form/EditorTagFormSidebar";

export default function EditorTagCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<TagFormState>(emptyTagForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial order logic
  useEffect(() => {
    async function initOrder() {
      try {
        const res = await http.get<Tag[]>("/editor/tags");
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          const nextOrder = getNextAvailableOrder(list);
          setForm((prev) => ({ ...prev, sort_order: String(nextOrder) }));
        }
      } catch (err) {
        console.error("Gagal memuat auto-order:", err);
      }
    }
    void initOrder();
  }, []);

  const handleChange = (updates: Partial<TagFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Nama tag wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      await http.post("/editor/tags", {
        name: form.name.trim(),
        url: form.url.trim() || undefined,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order, 10) || 0,
        open_in_new_tab: form.open_in_new_tab,
      });

      toast.success("Tag berhasil dibuat.");
      navigate("/editor/tags");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan tag.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(form.name.trim());

  return (
    <div className="space-y-6 pb-20">
      <EditorTagFormHeader
        mode="create"
        saving={saving}
        deleting={false}
        canSubmit={isFormValid}
        onSubmit={handleSubmit}
        onBack={() => navigate("/editor/tags")}
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EditorTagFormMain form={form} onChange={handleChange} disabled={saving} mode="create" />
        </div>
        <div className="lg:col-span-1">
          <EditorTagFormSidebar form={form} onChange={handleChange} disabled={saving} />
        </div>
      </div>
    </div>
  );
}
