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
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

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

  const publishedCount = banners.filter((b) => b.status !== "draft").length;
  const draftCount = banners.filter((b) => b.status === "draft").length;

  const filteredBanners = banners.filter((b) => {
    if (statusFilter === "published") return b.status !== "draft";
    if (statusFilter === "draft") return b.status === "draft";
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <EditorBannersHeader 
        total={banners.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        onCreate={() => navigate("/editor/banners/create")}
        loading={loading}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={[
            "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
            statusFilter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
        >
          Semua ({banners.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("published")}
          className={[
            "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
            statusFilter === "published"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
        >
          Dipublikasikan ({publishedCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className={[
            "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
            statusFilter === "draft"
              ? "bg-amber-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
        >
          Draf ({draftCount})
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <EditorBannersTable
        banners={filteredBanners}
        loading={loading}
        onEdit={(id) => navigate(`/editor/banners/${id}/edit`)}
      />

      {!loading && filteredBanners.length === 0 && !error && (
        <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
          <p className="text-sm font-bold">
            {banners.length === 0
              ? "Belum ada banner yang ditambahkan"
              : `Tidak ada banner dengan status "${statusFilter === "published" ? "Dipublikasikan" : "Draf"}"`}
          </p>
          <p className="mt-1 text-xs">
            {banners.length === 0
              ? "Klik tombol \"Tambah Banner\" untuk memulai slideshow beranda."
              : "Coba pilih tab filter lain atau tambah banner baru."}
          </p>
        </div>
      )}
    </div>
  );
}
