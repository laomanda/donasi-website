import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminSuggestionDetailHero from "@/components/management/admin/suggestions/AdminSuggestionDetailHero";
import AdminSuggestionInfoCard from "@/components/management/admin/suggestions/AdminSuggestionInfoCard";
import AdminSuggestionActionSidebar from "@/components/management/admin/suggestions/AdminSuggestionActionSidebar";

interface Suggestion {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  status: "baru" | "dibalas";
  is_anonymous: boolean;
  created_at: string;
}

export function AdminSuggestionShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [item, setItem] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await http.get<Suggestion>(`/admin/suggestions/${id}`);
        setItem(res.data);
      } catch {
        setError("Saran tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    void fetchDetail();
  }, [id]);

  const onDelete = async () => {
    setDeleting(true);
    try {
      await http.delete(`/admin/suggestions/${id}`);
      toast.success("Saran berhasil dihapus.", { title: "Berhasil" });
      navigate("/admin/suggestions", { replace: true });
    } catch {
      toast.error("Gagal menghapus saran.", { title: "Gagal" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleStatusChange = async (val: "baru" | "dibalas") => {
    if (!item) return;
    setIsChangingStatus(true);
    try {
      await http.patch(`/admin/suggestions/${item.id}/status`, { status: val });
      setItem({ ...item, status: val });
      toast.success("Status berhasil diubah.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal mengubah status.", { title: "Gagal" });
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminSuggestionDetailHero
        loading={loading}
        onBack={() => navigate("/admin/suggestions")}
      />

      {error ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        </div>
      ) : item && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8 lg:sticky lg:top-24 lg:h-fit lg:self-start lg:z-10">
            <AdminSuggestionInfoCard item={item} />
          </div>

          <AdminSuggestionActionSidebar
            item={item}
            isChangingStatus={isChangingStatus}
            onStatusChange={handleStatusChange}
            confirmDelete={confirmDelete}
            onConfirmDelete={setConfirmDelete}
            deleting={deleting}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}

export default AdminSuggestionShowPage;
