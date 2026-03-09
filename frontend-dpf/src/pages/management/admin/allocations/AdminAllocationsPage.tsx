


import { useEffect, useState } from "react";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminAllocationHeader from "@/components/management/admin/allocations/AdminAllocationHeader";
import AdminAllocationFilters from "@/components/management/admin/allocations/AdminAllocationFilters";
import AdminAllocationTable from "@/components/management/admin/allocations/AdminAllocationTable";
import AdminAllocationList from "@/components/management/admin/allocations/AdminAllocationList";
import AdminAllocationPagination from "@/components/management/admin/allocations/AdminAllocationPagination";

// Types
import type { Allocation } from "@/types/allocation";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function AdminAllocationsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 25;

  const fetchData = async (search = "", pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await http.get("/admin/allocations", {
        params: { q: search, page: pageNum, per_page: perPage },
      });
      setAllocations(data.data.data);
      setTotal(data.data.total);
      setLastPage(data.data.last_page);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data alokasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData(q, page);
    }, 500);
    return () => clearTimeout(timer);
  }, [q, page]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [q]);

  const pageLabel = `Halaman ${page} dari ${lastPage} (Total ${total} Alokasi)`;

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <AdminAllocationHeader total={total} />
      
      <AdminAllocationFilters q={q} setQ={setQ} />

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <AdminAllocationTable 
          allocations={allocations}
          loading={loading}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />

        <AdminAllocationList 
          allocations={allocations}
          loading={loading}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />

        <AdminAllocationPagination
          page={page}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          loading={loading}
          pageLabel={pageLabel}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default AdminAllocationsPage;

