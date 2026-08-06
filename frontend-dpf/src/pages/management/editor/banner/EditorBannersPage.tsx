import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import EditorBannersHeader from "../../../../components/management/editor/banner/list/EditorBannersHeader";
import EditorBannersTable from "../../../../components/management/editor/banner/list/EditorBannersTable";
import { type Banner } from "../../../../components/management/editor/banner/EditorBannerTypes";

export default function EditorBannersPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Banner[]>("/editor/banners");
      const list = Array.isArray(res.data) ? res.data : [];
      // Sort by display order
      setBanners(list.sort((a, b) => a.display_order - b.display_order));
    } catch {
      setError("Gagal memuat data banner. Silakan coba lagi.");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <EditorBannersHeader 
        total={banners.length} 
        onCreate={() => navigate("/editor/banners/create")}
        loading={loading}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <EditorBannersTable
        banners={banners}
        loading={loading}
        onEdit={(id) => navigate(`/editor/banners/${id}/edit`)}
      />

      {!loading && banners.length === 0 && !error && (
        <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
          <p className="text-sm font-bold">Belum ada banner yang ditambahkan</p>
          <p className="mt-1 text-xs">Klik tombol "Tambah Banner" untuk memulai slideshow beranda.</p>
        </div>
      )}
    </div>
  );
}
