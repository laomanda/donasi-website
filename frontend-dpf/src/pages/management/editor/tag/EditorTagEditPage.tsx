import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import {
  type Tag,
  type TagFormState,
  emptyTagForm,
} from "../../../../components/management/editor/tag/EditorTagTypes";

import EditorTagFormHeader from "../../../../components/management/editor/tag/form/EditorTagFormHeader";
import EditorTagFormMain from "../../../../components/management/editor/tag/form/EditorTagFormMain";
import EditorTagFormSidebar from "../../../../components/management/editor/tag/form/EditorTagFormSidebar";

export default function EditorTagEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<TagFormState>(emptyTagForm);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTag() {
      try {
        const res = await http.get<{ data: Tag }>(`/editor/tags/${id}`);
        const data = res.data.data || (res.data as unknown as Tag);
        setTag(data);
        setForm({
          name: data.name || "",
          url: data.url || "",
          is_active: data.is_active ?? true,
          sort_order: String(data.sort_order ?? 0),
          open_in_new_tab: data.open_in_new_tab ?? true,
        });
      } catch (err: any) {
        console.error("Gagal memuat tag:", err);
        setError("Gagal memuat data tag. Mungkin tag tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }
    if (id) void loadTag();
  }, [id]);

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
      await http.put(`/editor/tags/${id}`, {
        name: form.name.trim(),
        url: form.url.trim() || undefined,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order, 10) || 0,
        open_in_new_tab: form.open_in_new_tab,
      });

      toast.success("Tag berhasil diperbarui.");
      navigate("/editor/tags");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan tag.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tag) return;
    setDeleting(true);
    setError(null);
    try {
      await http.delete(`/editor/tags/${tag.id}`);
      toast.success("Tag berhasil dihapus.");
      navigate("/editor/tags");
    } catch (err: any) {
      console.error(err);
      setError("Gagal menghapus tag.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="font-semibold text-slate-500 animate-pulse">Memuat data tag...</p>
      </div>
    );
  }

  const isFormValid = Boolean(form.name.trim());
  const isBusy = saving || deleting;

  return (
    <div className="space-y-6 pb-20">
      <EditorTagFormHeader
        mode="edit"
        saving={saving}
        deleting={deleting}
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
          <EditorTagFormMain 
            form={form} 
            onChange={handleChange} 
            disabled={isBusy} 
            mode="edit" 
            onDelete={handleDelete}
            deleting={deleting}
          />
        </div>
        <div className="lg:col-span-1">
          <EditorTagFormSidebar form={form} onChange={handleChange} disabled={isBusy} />
        </div>
      </div>
    </div>
  );
}
